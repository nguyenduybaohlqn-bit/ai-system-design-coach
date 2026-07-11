from enum import Enum, auto

class ActionType(Enum):
    ASK_QUESTION = auto()
    CHALLENGE = auto()
    CHANGE_PHASE = auto()
    EVALUATE = auto()
    FINISH = auto()