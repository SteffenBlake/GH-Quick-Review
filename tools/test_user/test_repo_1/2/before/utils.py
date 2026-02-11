# Python example with various syntax elements
import hashlib
import datetime
from typing import List, Dict, Optional

class UserValidator:
    """Validates user data before saving"""
    
    def __init__(self, min_name_length: int = 2):
        self.min_name_length = min_name_length
        self.email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    def validate_user(self, user_data: Dict) -> bool:
        """
        Validate user data
        
        Args:
            user_data: Dictionary containing user information
            
        Returns:
            True if valid, False otherwise
        """
        if not self._validate_name(user_data.get('name')):
            return False
        
        if not self._validate_email(user_data.get('email')):
            return False
        
        return True
    
    def _validate_name(self, name: Optional[str]) -> bool:
        return name is not None and len(name) >= self.min_name_length
    
    def _validate_email(self, email: Optional[str]) -> bool:
        import re
        return email is not None and re.match(self.email_pattern, email) is not None
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
