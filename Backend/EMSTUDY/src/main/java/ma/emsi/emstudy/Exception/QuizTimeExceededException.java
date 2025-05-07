package ma.emsi.emstudy.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class QuizTimeExceededException extends RuntimeException {
    public QuizTimeExceededException(String message) {
        super(message);
    }
}
