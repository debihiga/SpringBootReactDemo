package com.debihiga.springbootreactdemo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

// tag::code[]
@Configuration
/**
 *  tells Spring Boot to drop its autoconfigured security policy and use this one instead.
*/
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Autowired
    private SpringDataJpaUserDetailsService userDetailsService;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(this.userDetailsService)
                .passwordEncoder(Manager.PASSWORD_ENCODER);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception { // <5>
        http
                .authorizeRequests()
                // granted unconditional access, since there is no reason to block static web resources.
                    .antMatchers("/built/**", "/main.css").permitAll()
                    .anyRequest().authenticated()
                    .and()
                // use form-based authentication (defaulting to / upon success) and to grant access to the login page.
                .formLogin()
                    .defaultSuccessUrl("/", true)
                    .permitAll()
                    .and()
                // BASIC login is also configured with CSRF disabled. This is mostly for demonstrations and not recommended for production systems without careful analysis.
                .httpBasic()
                    .and()
                .csrf().disable()
                .logout()
                .logoutSuccessUrl("/");
    }

}
// end::code[]