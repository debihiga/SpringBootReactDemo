package com.debihiga.springbootreactdemo;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * From: https://spring.io/guides/tutorials/react-and-spring-data-rest/
 */
/**
 * CrudRepository
 * Interface for generic CRUD operations on a repository for a specific type.
 * The Spring Data Repository will auto-generate the implementation based on the name we provided it.
 *
 * PagingAndSortingRepository (extends CrudRepository)
 * Adds extra options to set page size and adds navigational links to hop from page to page.
 * In the HAL response (http://stateless.co/hal_specification.html)
 * returns additional info in the links about the page.
 * For example, if the page is "http://localhost:8080/api/employees?page=1&size=2"
 * {
 *   "_links" : {
 *     "first" : {
 *       "href" : "http://localhost:8080/api/employees?page=0&size=2"
 *     },
 *     "prev" : {
 *       "href" : "http://localhost:8080/api/employees?page=0&size=2"
 *     },
 *     "self" : {
 *       "href" : "http://localhost:8080/api/employees"
 *     },
 *     "next" : {
 *       "href" : "http://localhost:8080/api/employees?page=2&size=2"
 *     },
 *     "last" : {
 *       "href" : "http://localhost:8080/api/employees?page=2&size=2"
 *     }
 *   },
 * ...
 */
/**
 * ONLY managers can view employee payroll data
 * Saving, updating, and deleting operations are confined to the employee’s manager
 * */
@PreAuthorize("hasRole('ROLE_MANAGER')")
public interface EmployeeRepository extends PagingAndSortingRepository<Employee, Long> {

    /**
     * Either the employee’s manager is null
     *      (initial creation of a new employee when no manager has been assigned),
     * or the employee’s manager’s name matches the currently authenticated user’s name.
     * Here, you are using Spring Security’s SpEL expressions to define access.
     * It comes with a handy ?. property navigator to handle null checks.
     * It is also important to note using the @Param(…​) on the arguments to link HTTP operations with the methods.
     * */
    @Override
    @PreAuthorize("#employee?.manager == null or #employee?.manager?.name == authentication?.name")
    Employee save(@Param("employee") Employee employee);

    /**
     * The method either has access to the employee,
     * or if it has only an id,
     * it must find the employeeRepository in the application context,
     * perform a findOne(id), and check the manager against the currently authenticated user.
     * */
    @Override
    @PreAuthorize("@employeeRepository.findById(#id)?.manager?.name == authentication?.name")
    void deleteById(@Param("id") Long id);

    @Override
    @PreAuthorize("#employee?.manager?.name == authentication?.name")
    void delete(@Param("employee") Employee employee);
}