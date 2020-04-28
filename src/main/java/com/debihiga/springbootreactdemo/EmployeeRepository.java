package com.debihiga.springbootreactdemo;

import org.springframework.data.repository.PagingAndSortingRepository;

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
public interface EmployeeRepository extends PagingAndSortingRepository<Employee, Long> {

}