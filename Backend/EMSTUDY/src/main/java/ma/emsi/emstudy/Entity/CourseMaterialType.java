package ma.emsi.emstudy.Entity;

public enum CourseMaterialType {
    TEXT,
    PDF,
    LINK,
    VIDEO;
    public static CourseMaterialType from(String value) {
        String format = value.contains("/") ? value.substring(value.lastIndexOf("/") + 1) : value;
        for (CourseMaterialType t : values()) {
            if (t.name().equalsIgnoreCase(format)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Invalid file type: " + value);
    }
}
