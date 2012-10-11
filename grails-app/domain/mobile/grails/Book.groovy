package mobile.grails

import javax.security.sasl.AuthorizeCallback

class Book {

    String title
    String isbn
    Double latitude
    Double longitude
    Author author


    static constraints = {
    }

    String toString() {
        return "${title} by ${author}"
    }
}
