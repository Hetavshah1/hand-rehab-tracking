import cv2
import mediapipe as mp
import numpy as np
import json
import os
from datetime import datetime
from extensions import db
from models import VideoCapture, MovementAnalysis, ExercisePerformance
import math

class ExoskeletonVisionAnalyzer:
    def __init__(self):
        # Initialize MediaPipe pose detection
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Define key joints for arm movement analysis
        self.arm_joints = {
            'wrist': self.mp_pose.PoseLandmark.LEFT_WRIST,
            'elbow': self.mp_pose.PoseLandmark.LEFT_ELBOW,
            'shoulder': self.mp_pose.PoseLandmark.LEFT_SHOULDER
        }
    
    def analyze_video(self, video_path, patient_id, session_id=None, exercise_id=None):
        """
        Analyze a video file and extract movement data
        """
        try:
            # Create video capture record
            video_capture = VideoCapture(
                patient_id=patient_id,
                session_id=session_id,
                video_file_path=video_path,
                processing_status='processing'
            )
            db.session.add(video_capture)
            db.session.commit()
            
            # Process video
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps
            
            # Update video capture with duration
            video_capture.duration_seconds = duration
            video_capture.file_size_bytes = os.path.getsize(video_path)
            
            frame_number = 0
            movement_data = []
            joint_positions_history = []
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Process frame
                frame_data = self.process_frame(frame, frame_number, fps)
                if frame_data:
                    movement_data.append(frame_data)
                    joint_positions_history.append(frame_data['joint_positions'])
                
                frame_number += 1
            
            cap.release()
            
            # Save movement analysis data
            self.save_movement_analysis(video_capture.id, movement_data)
            
            # Analyze exercise performance if exercise_id provided
            if exercise_id:
                performance_data = self.analyze_exercise_performance(
                    joint_positions_history, exercise_id, duration
                )
                self.save_exercise_performance(video_capture.id, exercise_id, performance_data)
            
            # Update processing status
            video_capture.processing_status = 'completed'
            db.session.commit()
            
            return {
                'success': True,
                'video_capture_id': video_capture.id,
                'frames_analyzed': len(movement_data),
                'duration': duration
            }
            
        except Exception as e:
            if 'video_capture' in locals():
                video_capture.processing_status = 'failed'
                db.session.commit()
            return {'success': False, 'error': str(e)}
    
    def process_frame(self, frame, frame_number, fps):
        """
        Process a single frame and extract movement data
        """
        try:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process with MediaPipe
            results = self.pose.process(rgb_frame)
            
            if not results.pose_landmarks:
                return None
            
            # Extract joint positions
            landmarks = results.pose_landmarks.landmark
            joint_positions = {}
            
            for joint_name, landmark_idx in self.arm_joints.items():
                landmark = landmarks[landmark_idx]
                joint_positions[joint_name] = [
                    landmark.x * frame.shape[1],  # Convert to pixel coordinates
                    landmark.y * frame.shape[0]
                ]
            
            # Calculate movement metrics
            range_of_motion = self.calculate_range_of_motion(joint_positions)
            joint_angles = self.calculate_joint_angles(joint_positions)
            
            # Calculate movement speed (if we have previous frame data)
            movement_speed = 0  # Will be calculated in batch processing
            
            return {
                'frame_number': frame_number,
                'timestamp_seconds': frame_number / fps,
                'joint_positions': joint_positions,
                'range_of_motion': range_of_motion,
                'joint_angles': joint_angles,
                'movement_speed': movement_speed,
                'detection_confidence': results.pose_landmarks.landmark[self.arm_joints['wrist']].visibility
            }
            
        except Exception as e:
            print(f"Error processing frame {frame_number}: {e}")
            return None
    
    def calculate_range_of_motion(self, joint_positions):
        """
        Calculate range of motion for arm movement
        """
        try:
            wrist = joint_positions['wrist']
            elbow = joint_positions['elbow']
            shoulder = joint_positions['shoulder']
            
            # Calculate angle at elbow
            angle = self.calculate_angle(shoulder, elbow, wrist)
            return angle
        except:
            return 0
    
    def calculate_joint_angles(self, joint_positions):
        """
        Calculate angles at different joints
        """
        try:
            wrist = joint_positions['wrist']
            elbow = joint_positions['elbow']
            shoulder = joint_positions['shoulder']
            
            elbow_angle = self.calculate_angle(shoulder, elbow, wrist)
            shoulder_angle = self.calculate_angle([elbow[0], elbow[1] - 100], shoulder, elbow)
            
            return {
                'elbow_angle': elbow_angle,
                'shoulder_angle': shoulder_angle
            }
        except:
            return {'elbow_angle': 0, 'shoulder_angle': 0}
    
    def calculate_angle(self, point1, point2, point3):
        """
        Calculate angle between three points
        """
        try:
            # Convert to numpy arrays
            p1 = np.array(point1)
            p2 = np.array(point2)
            p3 = np.array(point3)
            
            # Calculate vectors
            v1 = p1 - p2
            v2 = p3 - p2
            
            # Calculate angle
            cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
            cos_angle = np.clip(cos_angle, -1.0, 1.0)
            angle = np.arccos(cos_angle)
            
            return np.degrees(angle)
        except:
            return 0
    
    def save_movement_analysis(self, video_capture_id, movement_data):
        """
        Save movement analysis data to database
        """
        for data in movement_data:
            analysis = MovementAnalysis(
                video_capture_id=video_capture_id,
                frame_number=data['frame_number'],
                timestamp_seconds=data['timestamp_seconds'],
                joint_positions=json.dumps(data['joint_positions']),
                range_of_motion=data['range_of_motion'],
                movement_speed=data['movement_speed'],
                joint_angles=json.dumps(data['joint_angles']),
                detection_confidence=data['detection_confidence']
            )
            db.session.add(analysis)
        
        db.session.commit()
    
    def analyze_exercise_performance(self, joint_positions_history, exercise_id, duration):
        """
        Analyze exercise performance based on movement data
        """
        try:
            # Count repetitions (simplified - based on range of motion cycles)
            repetitions = self.count_repetitions(joint_positions_history)
            
            # Calculate form quality
            form_score = self.calculate_form_quality(joint_positions_history)
            
            # Calculate average range of motion
            avg_rom = self.calculate_average_rom(joint_positions_history)
            
            # Detect fatigue indicators
            fatigue_indicators = self.detect_fatigue(joint_positions_history)
            
            # Generate improvement suggestions
            suggestions = self.generate_suggestions(form_score, avg_rom, fatigue_indicators)
            
            return {
                'repetitions_completed': repetitions,
                'correct_form_percentage': form_score,
                'average_range_of_motion': avg_rom,
                'exercise_duration_seconds': duration,
                'fatigue_indicators': fatigue_indicators,
                'form_analysis': json.dumps({'score': form_score, 'details': 'Detailed analysis'}),
                'improvement_suggestions': json.dumps(suggestions),
                'overall_score': (form_score + (repetitions * 10)) / 2
            }
        except Exception as e:
            return {
                'repetitions_completed': 0,
                'correct_form_percentage': 0,
                'average_range_of_motion': 0,
                'exercise_duration_seconds': duration,
                'fatigue_indicators': {},
                'form_analysis': json.dumps({'error': str(e)}),
                'improvement_suggestions': json.dumps(['Error in analysis']),
                'overall_score': 0
            }
    
    def count_repetitions(self, joint_positions_history):
        """
        Count exercise repetitions based on movement patterns
        """
        # Simplified repetition counting
        # In a real implementation, you'd use more sophisticated algorithms
        return len(joint_positions_history) // 30  # Rough estimate
    
    def calculate_form_quality(self, joint_positions_history):
        """
        Calculate form quality score (0-100)
        """
        # Simplified form quality calculation
        # In reality, you'd compare against ideal movement patterns
        return min(100, len(joint_positions_history) * 2)
    
    def calculate_average_rom(self, joint_positions_history):
        """
        Calculate average range of motion
        """
        if not joint_positions_history:
            return 0
        
        total_rom = 0
        for positions in joint_positions_history:
            rom = self.calculate_range_of_motion(positions)
            total_rom += rom
        
        return total_rom / len(joint_positions_history)
    
    def detect_fatigue(self, joint_positions_history):
        """
        Detect fatigue indicators
        """
        # Simplified fatigue detection
        return {
            'tremor': 0.1,
            'speed_decrease': 0.05,
            'form_deterioration': 0.02
        }
    
    def generate_suggestions(self, form_score, avg_rom, fatigue_indicators):
        """
        Generate improvement suggestions
        """
        suggestions = []
        
        if form_score < 70:
            suggestions.append("Focus on maintaining proper form throughout the exercise")
        
        if avg_rom < 90:
            suggestions.append("Try to increase your range of motion")
        
        if fatigue_indicators.get('tremor', 0) > 0.2:
            suggestions.append("Consider taking a break to avoid overexertion")
        
        return suggestions
    
    def save_exercise_performance(self, video_capture_id, exercise_id, performance_data):
        """
        Save exercise performance data to database
        """
        performance = ExercisePerformance(
            video_capture_id=video_capture_id,
            exercise_id=exercise_id,
            repetitions_completed=performance_data['repetitions_completed'],
            correct_form_percentage=performance_data['correct_form_percentage'],
            average_range_of_motion=performance_data['average_range_of_motion'],
            exercise_duration_seconds=performance_data['exercise_duration_seconds'],
            fatigue_indicators=json.dumps(performance_data['fatigue_indicators']),
            form_analysis=performance_data['form_analysis'],
            improvement_suggestions=performance_data['improvement_suggestions'],
            overall_score=performance_data['overall_score']
        )
        db.session.add(performance)
        db.session.commit()


