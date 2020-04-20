package com.debihiga.seleniumdemo;

import org.springframework.data.repository.CrudRepository;

/**
 * From: https://spring.io/guides/tutorials/react-and-spring-data-rest/
 */
public interface EmployeeRepository extends CrudRepository<Employee, Long> {

}