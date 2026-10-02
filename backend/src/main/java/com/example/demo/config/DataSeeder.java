package com.example.demo.config;

import com.example.demo.entity.CodingChallenge;
import com.example.demo.entity.ContestantProfile;
import com.example.demo.entity.SystemUser;
import com.example.demo.repository.CodingChallengeRepository;
import com.example.demo.repository.ContestantProfileRepository;
import com.example.demo.repository.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private SystemUserRepository userRepository;

    @Autowired
    private ContestantProfileRepository profileRepository;

    @Autowired
    private CodingChallengeRepository challengeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername("admin").isEmpty()) {
            SystemUser admin = new SystemUser("admin", passwordEncoder.encode("admin123"), "ROLE_ADMIN");
            userRepository.save(admin);
        }

        SystemUser setter;
        if (userRepository.findByUsername("setter").isEmpty()) {
            setter = new SystemUser("setter", passwordEncoder.encode("setter123"), "ROLE_PROBLEM_SETTER");
            setter = userRepository.save(setter);
        } else {
            setter = userRepository.findByUsername("setter").get();
        }

        if (userRepository.findByUsername("contestant").isEmpty()) {
            SystemUser contestant = new SystemUser("contestant", passwordEncoder.encode("user123"), "ROLE_CONTESTANT");
            contestant = userRepository.save(contestant);

            ContestantProfile profile = new ContestantProfile();
            profile.setUser(contestant);
            profile.setUsername("contestant");
            profile.setBio("Competitive programming enthusiast");
            profile.setTotalPoints(500);
            profile.setGlobalRank(1);
            profileRepository.save(profile);
        }

        if (challengeRepository.count() < 15) {
            String[] titles = {
                "Two Sum", "Reverse Linked List", "Valid Parentheses", "Merge Two Sorted Lists",
                "Maximum Subarray", "Climbing Stairs", "Binary Tree Inorder Traversal", "Symmetric Tree",
                "Best Time to Buy and Sell Stock", "Single Number", "Linked List Cycle", "Min Stack",
                "Intersection of Two Linked Lists", "Majority Element", "Reverse Bits"
            };
            String[] diffs = {"EASY", "EASY", "EASY", "EASY", "MEDIUM", "EASY", "EASY", "EASY", "EASY", "EASY", "EASY", "MEDIUM", "EASY", "EASY", "EASY"};
            int[] points = {100, 100, 100, 100, 200, 100, 100, 100, 100, 100, 100, 200, 100, 100, 100};

            for (int i = 0; i < titles.length; i++) {
                CodingChallenge c = new CodingChallenge();
                c.setTitle(titles[i]);
                c.setDescription("Solve the classic " + titles[i] + " algorithmic problem.");
                c.setDifficulty(diffs[i]);
                c.setBasePoints(points[i]);
                c.setTimeLimitMs(1000);
                c.setStatus("PUBLISHED");
                c.setSetter(setter);
                challengeRepository.save(c);
            }
        }
    }
}
