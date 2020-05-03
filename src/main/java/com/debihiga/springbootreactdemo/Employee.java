package com.debihiga.springbootreactdemo;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Version;
import java.util.Objects;

/**
 * From: https://spring.io/guides/tutorials/react-and-spring-data-rest/
 *
 * Entity -> class for storage in a relational table.
 * */
@Entity
public class Employee {

    @Id
    @GeneratedValue
    private Long id; // primary key, generated automatically when needed.
    private String firstName;
    private String lastName;
    private String description;

    /**
     * When you fetch a resource,
     * the risk is that it might go stale if someone else updates it.
     * To deal with this, Spring Data REST integrates two technologies: versioning of resources (1) and ETags (2).
     * By versioning resources on the backend and using ETags in the frontend,
     * it is possible to conditionally PUT a change.
     * In other words, you can detect whether a resource has changed and
     * prevent a PUT (or a PATCH) from stomping on someone else’s update.
     *
     * (1) The annotation javax.persistence.Version
     * causes a value to be automatically stored and updated every time a row is inserted and updated.
     * (2) When fetching an individual resource (not a collection resource),
     * Spring Data REST automatically adds an ETag response header with the value of this field.
     * */
    private @Version
    @JsonIgnore
    Long version;

    private Employee() {}

    public Employee(String firstName, String lastName, String description) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee employee = (Employee) o;
        return Objects.equals(id, employee.id) &&
                Objects.equals(firstName, employee.firstName) &&
                Objects.equals(lastName, employee.lastName) &&
                Objects.equals(description, employee.description) &&
                Objects.equals(version, employee.version);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, firstName, lastName, description, version);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    @Override
    public String toString() {
        return "Employee{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", description='" + description + '\'' +
                ", version=" + version +
                '}';
    }

}