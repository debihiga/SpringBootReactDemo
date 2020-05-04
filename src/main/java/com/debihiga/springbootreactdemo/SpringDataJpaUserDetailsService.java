package com.debihiga.springbootreactdemo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

// tag::code[]
@Component
public class SpringDataJpaUserDetailsService implements UserDetailsService {

    private final ManagerRepository repository;

    @Autowired
    public SpringDataJpaUserDetailsService(ManagerRepository repository) {
        this.repository = repository;
    }

    /**
     * The interface has one method: loadUserByUsername().
     * This method is meant to return a UserDetails object so that Spring Security can interrogate the user’s information.
     *
     * Because you have a ManagerRepository, there is no need to write any SQL or JPA expressions to fetch this needed data.
     * In this class, it is autowired by constructor injection.
     *
     * loadUserByUsername() taps into the custom finder you wrote a moment ago, findByName().
     * It then populates a Spring Security User instance, which implements the UserDetails interface.
     * You are also using Spring Security’s AuthorityUtils to transition from an array of string-based roles
     * into a Java List of type GrantedAuthority.
     * */
    @Override
    public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
        Manager manager = this.repository.findByName(name);
        return new User(manager.getName(), manager.getPassword(),
                AuthorityUtils.createAuthorityList(manager.getRoles()));
    }

}
// end::code[]
