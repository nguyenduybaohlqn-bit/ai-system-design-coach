from enum import Enum, auto

class DesignTopic(Enum):

    # Requirement
    USERS = auto()
    TRAFFIC = auto()
    LATENCY = auto()
    AVAILABILITY = auto()
    CONSISTENCY = auto()
    STORAGE_REQUIREMENT = auto()

    # High Level Design
    API = auto()
    LOAD_BALANCER = auto()
    DATABASE = auto()
    CACHE = auto()
    MESSAGE_QUEUE = auto()
    CDN = auto()
    STORAGE = auto()

    # Deep Dive
    DATABASE_SHARDING = auto()
    REPLICATION = auto()
    CACHE_INVALIDATION = auto()
    CONSISTENT_HASHING = auto()
    LEADER_FOLLOWER = auto()
    PARTITIONING = auto()

    # Reliability
    FAULT_TOLERANCE = auto()
    BACKUP = auto()
    MONITORING = auto()