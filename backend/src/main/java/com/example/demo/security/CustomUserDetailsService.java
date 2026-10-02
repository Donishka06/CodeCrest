package com.example.demo.security;

import com.example.demo.entity.SystemUser;
import com.example.demo.repository.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private SystemUserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String trimmed = username != null ? username.trim() : "";
        SystemUser user = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(trimmed, trimmed)
                .orElseGet(() -> userRepository.findByUsernameOrEmail(trimmed, trimmed)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username)));

        String role = user.getRole();
        if (role == null) {
            role = "ROLE_CONTESTANT";
        } else if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        return new User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(role))
        );
    }
}
