from enum import Enum

class RequirementStatus(str, Enum):
    UNANSWERED = "unanswered"
    ANSWERED = "answered"
    AMBIGUOUS = "ambiguous"