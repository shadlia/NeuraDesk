from supabase import create_client, Client
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class SupabaseService:
    """
    Centralized Supabase client service for the backend.
    Provides a singleton instance for database operations.
    """
    
    _instance: Optional['SupabaseService'] = None
    _client: Optional[Client] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._initialize_client()
    
    def _initialize_client(self):
        """Initialize the Supabase client with environment variables."""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError(
                "Supabase credentials not found. "
                "Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file"
            )
        
        self._client = create_client(supabase_url, supabase_key)
    
    @property
    def client(self) -> Client:
        """Get the Supabase client instance."""
        if self._client is None:
            self._initialize_client()
        return self._client
    
    def get_table(self, table_name: str):
        """
        Get a reference to a Supabase table.
        
        Args:
            table_name: Name of the table
            
        Returns:
            Table reference for queries
        """
        return self.client.table(table_name)


# Singleton instance for import
supabase_service = SupabaseService()


def get_supabase_client() -> Client:
    """
    Get the Supabase client instance.
    Convenience function for dependency injection.
    
    Returns:
        Supabase Client instance
    """
    return supabase_service.client
