from enum import Enum

class Phase(str, Enum):
    REQUIREMENT_GATHERING = "requirement_gathering"
    HIGH_LEVEL_DESIGN = "high_level_design"
    DEEP_DIVE = "deep_dive"
    EVALUATION = "evaluation"