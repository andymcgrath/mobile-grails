package mobile.grails

class Author {
    String firstName
    String lastName
    Date birthdate

    static constraints = {
        firstName()
        lastName()
        birthdate()
    }
}
