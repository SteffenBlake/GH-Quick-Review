# Python example with various syntax elements
import hashlib
import datetime
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class UserValidator:
    """Validates user data before saving"""
    
    def __init__(self, min_name_length: int = 3):
        self.min_name_length = min_name_length
        self.email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        self.max_name_length = 100
    
    def validate_user(self, user_data: Dict) -> bool:
        """
        Validate user data
        
        Args:
            user_data: Dictionary containing user information
            
        Returns:
            True if valid, False otherwise
            
        Raises:
            ValueError: If user_data is None
        """
        if user_data is None:
            raise ValueError("User data cannot be None")
        
        if not self._validate_name(user_data.get('name')):
            logger.warning(f"Invalid name: {user_data.get('name')}")
            return False
        
        if not self._validate_email(user_data.get('email')):
            logger.warning(f"Invalid email: {user_data.get('email')}")
            return False
        
        return True
    
    def _validate_name(self, name: Optional[str]) -> bool:
        if name is None:
            return False
        return self.min_name_length <= len(name) <= self.max_name_length
    
    def _validate_email(self, email: Optional[str]) -> bool:
        import re
        return email is not None and re.match(self.email_pattern, email) is not None
    
    @staticmethod
    def hash_password(password: str, salt: Optional[str] = None) -> str:
        """Hash a password using SHA-256 with optional salt"""
        if salt:
            password = password + salt
        return hashlib.sha256(password.encode()).hexdigest()
