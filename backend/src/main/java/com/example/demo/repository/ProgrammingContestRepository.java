package com.example.demo.repository;

import com.example.demo.entity.ProgrammingContest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgrammingContestRepository extends JpaRepository<ProgrammingContest, Long> {
}
