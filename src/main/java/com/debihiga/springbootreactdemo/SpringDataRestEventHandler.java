package com.debihiga.springbootreactdemo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * One part of a good user experience is when the application can automatically apply context.
 * In this example, if a logged-in manager creates a new employee record,
 * it makes sense for that manager to own it. With Spring Data REST’s event handlers,
 * there is no need for the user to explicitly link it.
 * It also ensures the user does not accidentally assign records to the wrong manager.
 * The SpringDataRestEventHandler handles that for us
 * */
// tag::code[]
@Component
@RepositoryEventHandler(Employee.class) // <1>
public class SpringDataRestEventHandler {

    private final ManagerRepository managerRepository;

    @Autowired
    public SpringDataRestEventHandler(ManagerRepository managerRepository) {
        this.managerRepository = managerRepository;
    }

    /**
     * One part of a good user experience is when the application can automatically apply context.
     * In this example, if a logged-in manager creates a new employee record,
     * it makes sense for that manager to own it.
     * With Spring Data REST’s event handlers, there is no need for the user to explicitly link it.
     * It also ensures the user does not accidentally assign records to the wrong manager.
     * The SpringDataRestEventHandler handles that for us
     * */
    @HandleBeforeCreate
    @HandleBeforeSave
    public void applyUserInformationUsingSecurityContext(Employee employee) {

        String name = SecurityContextHolder.getContext().getAuthentication().getName();
        Manager manager = this.managerRepository.findByName(name);
        if (manager == null) {
            Manager newManager = new Manager();
            newManager.setName(name);
            newManager.setRoles(new String[]{"ROLE_MANAGER"});
            manager = this.managerRepository.save(newManager);
        }
        employee.setManager(manager);
    }
}
// end::code[]