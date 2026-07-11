class CoachState:
    def __init__(self, conversation_id: str, system_type: str, current_phase : str, requirements, design_decision, pending_question, conversation_history):
        self.conversation_id = conversation_id
        self.system_type = system_type
        self.requirements = requirements
        self.current_phase = current_phase
        self.design_decision = design_decision
        self.pending_question = pending_question
        self.conversation_history = conversation_history
