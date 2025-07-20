import json
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sqlalchemy import func, desc, and_, text
from src.models.user import db
from src.models.chat import ChatSession, ChatMessage
from src.models.enhanced_models import (
    UploadedFile, RAGDocument, UserProfile, 
    WorkItem, Board, GraphNode, GraphEdge
)

class AnalyticsService:
    def __init__(self):
        pass
    
    def get_chat_analytics(self, user_id=None, days=30):
        """Get analytics data for chat activity"""
        try:
            # Calculate date range
            end_date = datetime.utcnow()
            start_date = end_date - timedelta(days=days)
            
            # Base query
            query = db.session.query(
                func.date(ChatMessage.created_at).label('date'),
                func.count().label('message_count')
            ).filter(ChatMessage.created_at >= start_date)
            
            # Filter by user if specified
            if user_id:
                query = query.join(ChatSession).filter(ChatSession.user_id == user_id)
            
            # Group by date and get results
            results = query.group_by(func.date(ChatMessage.created_at))\
                          .order_by(func.date(ChatMessage.created_at))\
                          .all()
            
            # Convert to list of dicts
            data = [{'date': str(r.date), 'message_count': r.message_count} for r in results]
            
            # Get total counts
            total_sessions = ChatSession.query.count()
            total_messages = ChatMessage.query.count()
            
            # Get average messages per session
            avg_messages = total_messages / total_sessions if total_sessions > 0 else 0
            
            # Get most active sessions
            active_sessions = db.session.query(
                ChatSession.id,
                ChatSession.title,
                func.count(ChatMessage.id).label('message_count')
            ).join(ChatMessage)\
             .group_by(ChatSession.id)\
             .order_by(desc('message_count'))\
             .limit(5)\
             .all()
            
            active_sessions_data = [
                {
                    'session_id': s.id,
                    'title': s.title,
                    'message_count': s.message_count
                } for s in active_sessions
            ]
            
            return {
                'daily_activity': data,
                'total_sessions': total_sessions,
                'total_messages': total_messages,
                'avg_messages_per_session': round(avg_messages, 2),
                'most_active_sessions': active_sessions_data
            }
            
        except Exception as e:
            print(f"Error getting chat analytics: {e}")
            return {
                'daily_activity': [],
                'total_sessions': 0,
                'total_messages': 0,
                'avg_messages_per_session': 0,
                'most_active_sessions': []
            }
    
    def get_file_analytics(self, user_id=None):
        """Get analytics data for uploaded files"""
        try:
            # Base query for file types
            file_type_query = db.session.query(
                UploadedFile.file_type,
                func.count().label('count'),
                func.sum(UploadedFile.file_size).label('total_size')
            )
            
            # Filter by user if specified
            if user_id:
                file_type_query = file_type_query.filter(UploadedFile.user_id == user_id)
            
            # Group by file type and get results
            file_types = file_type_query.group_by(UploadedFile.file_type)\
                                      .order_by(desc('count'))\
                                      .all()
            
            # Convert to list of dicts
            file_type_data = [
                {
                    'file_type': ft.file_type,
                    'count': ft.count,
                    'total_size': ft.total_size
                } for ft in file_types
            ]
            
            # Get total counts
            total_files = UploadedFile.query.count()
            total_size = db.session.query(func.sum(UploadedFile.file_size)).scalar() or 0
            
            # Get recent uploads
            recent_uploads = UploadedFile.query\
                .order_by(UploadedFile.created_at.desc())\
                .limit(5)\
                .all()
            
            recent_uploads_data = [
                {
                    'id': f.id,
                    'filename': f.original_filename,
                    'file_type': f.file_type,
                    'file_size': f.file_size,
                    'created_at': f.created_at.isoformat() if f.created_at else None
                } for f in recent_uploads
            ]
            
            return {
                'file_types': file_type_data,
                'total_files': total_files,
                'total_size': total_size,
                'recent_uploads': recent_uploads_data
            }
            
        except Exception as e:
            print(f"Error getting file analytics: {e}")
            return {
                'file_types': [],
                'total_files': 0,
                'total_size': 0,
                'recent_uploads': []
            }
    
    def get_rag_analytics(self, user_id=None):
        """Get analytics data for RAG system"""
        try:
            # Get document counts by source type
            source_query = db.session.query(
                RAGDocument.source_type,
                func.count().label('count')
            )
            
            # Filter by user if specified
            if user_id:
                source_query = source_query.filter(RAGDocument.user_id == user_id)
            
            # Group by source type and get results
            sources = source_query.group_by(RAGDocument.source_type)\
                                .order_by(desc('count'))\
                                .all()
            
            # Convert to list of dicts
            source_data = [
                {
                    'source_type': s.source_type,
                    'count': s.count
                } for s in sources
            ]
            
            # Get total counts
            total_documents = RAGDocument.query.count()
            
            return {
                'source_types': source_data,
                'total_documents': total_documents
            }
            
        except Exception as e:
            print(f"Error getting RAG analytics: {e}")
            return {
                'source_types': [],
                'total_documents': 0
            }
    
    def get_system_analytics(self):
        """Get overall system analytics"""
        try:
            # Get user count
            user_count = UserProfile.query.count()
            
            # Get total work items
            work_item_count = WorkItem.query.count()
            
            # Get total boards
            board_count = Board.query.count()
            
            # Get total graph nodes and edges
            node_count = GraphNode.query.count()
            edge_count = GraphEdge.query.count()
            
            # Get chat stats
            chat_stats = self.get_chat_analytics()
            
            # Get file stats
            file_stats = self.get_file_analytics()
            
            return {
                'user_count': user_count,
                'work_item_count': work_item_count,
                'board_count': board_count,
                'graph': {
                    'node_count': node_count,
                    'edge_count': edge_count
                },
                'chat_stats': {
                    'total_sessions': chat_stats['total_sessions'],
                    'total_messages': chat_stats['total_messages']
                },
                'file_stats': {
                    'total_files': file_stats['total_files'],
                    'total_size': file_stats['total_size']
                }
            }
            
        except Exception as e:
            print(f"Error getting system analytics: {e}")
            return {
                'user_count': 0,
                'work_item_count': 0,
                'board_count': 0,
                'graph': {
                    'node_count': 0,
                    'edge_count': 0
                },
                'chat_stats': {
                    'total_sessions': 0,
                    'total_messages': 0
                },
                'file_stats': {
                    'total_files': 0,
                    'total_size': 0
                }
            }
    
    def get_notion_analytics(self, user_id=None):
        """Get analytics data for Notion integration"""
        try:
            # Get document counts for Notion source
            notion_docs = RAGDocument.query\
                .filter(RAGDocument.source_type == 'notion')
            
            # Filter by user if specified
            if user_id:
                notion_docs = notion_docs.filter(RAGDocument.user_id == user_id)
            
            # Get count
            notion_count = notion_docs.count()
            
            # Get recent Notion pages
            recent_pages = notion_docs\
                .order_by(RAGDocument.created_at.desc())\
                .limit(5)\
                .all()
            
            recent_pages_data = [
                {
                    'id': p.id,
                    'title': p.title,
                    'source_id': p.source_id,
                    'created_at': p.created_at.isoformat() if p.created_at else None
                } for p in recent_pages
            ]
            
            return {
                'total_pages': notion_count,
                'recent_pages': recent_pages_data
            }
            
        except Exception as e:
            print(f"Error getting Notion analytics: {e}")
            return {
                'total_pages': 0,
                'recent_pages': []
            }
    
    def generate_mock_data(self):
        """Generate mock data for dashboard demo"""
        # Chat activity over time
        dates = pd.date_range(end=datetime.now(), periods=30).tolist()
        chat_activity = [
            {
                'date': d.strftime('%Y-%m-%d'),
                'message_count': np.random.randint(5, 50)
            } for d in dates
        ]
        
        # File types
        file_types = [
            {'file_type': 'pdf', 'count': 45, 'total_size': 128000000},
            {'file_type': 'docx', 'count': 32, 'total_size': 64000000},
            {'file_type': 'csv', 'count': 18, 'total_size': 12000000},
            {'file_type': 'txt', 'count': 15, 'total_size': 5000000},
            {'file_type': 'html', 'count': 10, 'total_size': 3000000}
        ]
        
        # RAG sources
        rag_sources = [
            {'source_type': 'file', 'count': 85},
            {'source_type': 'notion', 'count': 42},
            {'source_type': 'web', 'count': 23}
        ]
        
        # Recent uploads
        recent_uploads = [
            {
                'id': 1,
                'filename': 'business_report_q2_2025.pdf',
                'file_type': 'pdf',
                'file_size': 2500000,
                'created_at': (datetime.now() - timedelta(hours=2)).isoformat()
            },
            {
                'id': 2,
                'filename': 'sales_data.csv',
                'file_type': 'csv',
                'file_size': 1200000,
                'created_at': (datetime.now() - timedelta(hours=5)).isoformat()
            },
            {
                'id': 3,
                'filename': 'marketing_strategy.docx',
                'file_type': 'docx',
                'file_size': 1800000,
                'created_at': (datetime.now() - timedelta(days=1)).isoformat()
            },
            {
                'id': 4,
                'filename': 'project_notes.txt',
                'file_type': 'txt',
                'file_size': 50000,
                'created_at': (datetime.now() - timedelta(days=2)).isoformat()
            },
            {
                'id': 5,
                'filename': 'website_backup.html',
                'file_type': 'html',
                'file_size': 350000,
                'created_at': (datetime.now() - timedelta(days=3)).isoformat()
            }
        ]
        
        # Most active sessions
        active_sessions = [
            {'session_id': 1, 'title': 'วิเคราะห์ข้อมูลการขาย', 'message_count': 45},
            {'session_id': 2, 'title': 'แผนการตลาดปี 2025', 'message_count': 32},
            {'session_id': 3, 'title': 'ข้อมูลลูกค้า', 'message_count': 28},
            {'session_id': 4, 'title': 'รายงานการเงิน', 'message_count': 24},
            {'session_id': 5, 'title': 'แผนธุรกิจ', 'message_count': 18}
        ]
        
        # System stats
        system_stats = {
            'user_count': 25,
            'work_item_count': 120,
            'board_count': 15,
            'graph': {
                'node_count': 350,
                'edge_count': 420
            },
            'chat_stats': {
                'total_sessions': 85,
                'total_messages': 1250
            },
            'file_stats': {
                'total_files': 120,
                'total_size': 212000000
            }
        }
        
        return {
            'chat_analytics': {
                'daily_activity': chat_activity,
                'total_sessions': 85,
                'total_messages': 1250,
                'avg_messages_per_session': 14.7,
                'most_active_sessions': active_sessions
            },
            'file_analytics': {
                'file_types': file_types,
                'total_files': 120,
                'total_size': 212000000,
                'recent_uploads': recent_uploads
            },
            'rag_analytics': {
                'source_types': rag_sources,
                'total_documents': 150
            },
            'system_analytics': system_stats,
            'notion_analytics': {
                'total_pages': 42,
                'recent_pages': [
                    {
                        'id': 1,
                        'title': 'แผนการตลาด Q3 2025',
                        'source_id': 'abc123',
                        'created_at': (datetime.now() - timedelta(days=1)).isoformat()
                    },
                    {
                        'id': 2,
                        'title': 'รายงานการประชุมทีม',
                        'source_id': 'def456',
                        'created_at': (datetime.now() - timedelta(days=2)).isoformat()
                    },
                    {
                        'id': 3,
                        'title': 'แผนธุรกิจ 2025-2026',
                        'source_id': 'ghi789',
                        'created_at': (datetime.now() - timedelta(days=5)).isoformat()
                    }
                ]
            }
        }

# Create global instance
analytics_service = AnalyticsService()

