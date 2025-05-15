package ma.emsi.emstudy.Entity;

public enum CourseMaterialType {
    PDF,
    VIDEO,
    IMAGE,
    DOCUMENT,
    MARKDOWN,
    OTHER;

    public static CourseMaterialType from(String contentType) {
        if (contentType == null) return OTHER;
        
        return switch (contentType.toLowerCase()) {
            case "application/pdf" -> PDF;
            case "video/mp4", "video/mpeg", "video/quicktime" -> VIDEO;
            case "image/jpeg", "image/png", "image/gif" -> IMAGE;
            case "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" -> DOCUMENT;
            case "text/markdown" -> MARKDOWN;
            default -> OTHER;
        };
    }
}