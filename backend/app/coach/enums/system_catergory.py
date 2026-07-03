from enum import Enum

class SystemCategory(str, Enum):
    VIDEO_STREAMING = "video_streaming"
    RIDE_SHARING = "ride_sharing"
    URL_SHORTENER = "url_shortener"
    CLOUD_STORAGE = "cloud_storage"
    SOCIAL_NETWORK = "social_network"