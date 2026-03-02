from domain.api_client import get_submission
from domain.models import Submission

def fetch_submission(submission_id: int, student_id: int):
    data = get_submission(submission_id, student_id)

    submission = Submission(id = data[id],
                            student_id = data["student_id"],
                            contents = data["contents"],
                            )
    return submission