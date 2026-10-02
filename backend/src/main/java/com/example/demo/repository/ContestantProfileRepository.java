package com.example.demo.repository;

import com.example.demo.entity.ContestantProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContestantProfileRepository extends JpaRepository<ContestantProfile, Long> {
    Optional<ContestantProfile> findByUsername(String username);
    Optional<ContestantProfile> findByUsernameIgnoreCase(String username);
    Page<ContestantProfile> findAllByOrderByTotalPointsDesc(Pageable pageable);
    Page<ContestantProfile> findByUserRoleInOrderByTotalPointsDesc(java.util.List<String> roles, Pageable pageable);
}
