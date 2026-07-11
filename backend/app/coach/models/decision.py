from app.coach.enums.action_type import ActionType
from app.coach.enums.coach_phase import CoachPhase

class Decision:
    action: ActionType
    topic: str | None
    phase: CoachPhase | None
    reason: str