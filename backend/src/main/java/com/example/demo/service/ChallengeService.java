package com.example.demo.service;

import com.example.demo.dto.ChallengeCreationDto;
import com.example.demo.entity.CodingChallenge;
import com.example.demo.entity.SystemUser;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CodingChallengeRepository;
import com.example.demo.repository.SystemUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChallengeService {

    @Autowired
    private CodingChallengeRepository challengeRepository;

    @Autowired
    private SystemUserRepository userRepository;

    @Autowired
    private com.example.demo.repository.ChallengeSubmissionRepository submissionRepository;

    public List<CodingChallenge> getAllChallenges() {
        List<CodingChallenge> list = challengeRepository.findAll();
        for (CodingChallenge c : list) {
            enrichChallengeWithProblemSpecs(c);
        }
        return list;
    }

    public Page<CodingChallenge> getAllChallenges(Pageable pageable) {
        Page<CodingChallenge> page = challengeRepository.findAll(pageable);
        for (CodingChallenge c : page.getContent()) {
            enrichChallengeWithProblemSpecs(c);
        }
        return page;
    }

    public CodingChallenge getChallengeById(Long id) {
        CodingChallenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found with id: " + id));
        enrichChallengeWithProblemSpecs(challenge);
        return challenge;
    }

    public void enrichChallengeWithProblemSpecs(CodingChallenge c) {
        if (c == null) return;

        String title = c.getTitle() != null ? c.getTitle().trim() : "";
        String titleLower = title.toLowerCase();

        if (c.getSampleTestCases() != null && !c.getSampleTestCases().trim().isEmpty() &&
            c.getInputFormat() != null && !c.getInputFormat().trim().isEmpty()) {
            return;
        }

        if (titleLower.contains("two sum") || titleLower.contains("twosum")) {
            c.setTitle("Two Sum");
            c.setDescription("Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.");
            c.setInputFormat("First parameter is an array of integers `nums`, second parameter is an integer `target`.");
            c.setOutputFormat("An array of two integers `[index1, index2]` representing the zero-based indices.");
            c.setConstraints("• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9\n• Exactly one valid answer exists.");
            c.setSampleTestCases("[\n  {\"input\": \"[2, 7, 11, 15], 9\", \"expectedOutput\": \"[0, 1]\", \"explanation\": \"Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].\"},\n  {\"input\": \"[3, 2, 4], 6\", \"expectedOutput\": \"[1, 2]\", \"explanation\": \"Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2].\"},\n  {\"input\": \"[3, 3], 6\", \"expectedOutput\": \"[0, 1]\", \"explanation\": \"Because nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1].\"}\n]");
            c.setHiddenTestCases("[\n  {\"input\": \"[2, 7, 11, 15], 9\", \"expectedOutput\": \"[0, 1]\"},\n  {\"input\": \"[3, 2, 4], 6\", \"expectedOutput\": \"[1, 2]\"},\n  {\"input\": \"[3, 3], 6\", \"expectedOutput\": \"[0, 1]\"},\n  {\"input\": \"[1, 5, 8, 11, 19], 20\", \"expectedOutput\": \"[0, 4]\"},\n  {\"input\": \"[-3, 4, 3, 90], 0\", \"expectedOutput\": \"[0, 2]\"}\n]");
        } else if (titleLower.contains("algorithm") || titleLower.contains("reverse")) {
            c.setTitle("Reverse String");
            c.setDescription("Given a string `s`, reverse the sequence of characters in the string and return the result.");
            c.setInputFormat("A single string `s`.");
            c.setOutputFormat("A string representing `s` in reverse order.");
            c.setConstraints("• 1 <= s.length <= 10^5\n• `s` consists of printable ASCII characters.");
            c.setSampleTestCases("[\n  {\"input\": \"\\\"hello\\\"\", \"expectedOutput\": \"\\\"olleh\\\"\", \"explanation\": \"The reversed string of 'hello' is 'olleh'.\"},\n  {\"input\": \"\\\"world\\\"\", \"expectedOutput\": \"\\\"dlrow\\\"\", \"explanation\": \"The reversed string of 'world' is 'dlrow'.\"}\n]");
            c.setHiddenTestCases("[\n  {\"input\": \"\\\"hello\\\"\", \"expectedOutput\": \"\\\"olleh\\\"\"},\n  {\"input\": \"\\\"world\\\"\", \"expectedOutput\": \"\\\"dlrow\\\"\"},\n  {\"input\": \"\\\"racecar\\\"\", \"expectedOutput\": \"\\\"racecar\\\"\"},\n  {\"input\": \"\\\"CodeCrest\\\"\", \"expectedOutput\": \"\\\"tserCedoC\\\"\"}\n]");
        } else if (titleLower.contains("palindrome")) {
            c.setTitle("Palindrome Number");
            c.setDescription("Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same backward as forward.");
            c.setInputFormat("A single integer `x`.");
            c.setOutputFormat("Boolean value (`true` or `false`).");
            c.setConstraints("• -2^31 <= x <= 2^31 - 1");
            c.setSampleTestCases("[\n  {\"input\": \"121\", \"expectedOutput\": \"true\", \"explanation\": \"121 reads as 121 from left to right and from right to left.\"},\n  {\"input\": \"-121\", \"expectedOutput\": \"false\", \"explanation\": \"From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.\"}\n]");
            c.setHiddenTestCases("[\n  {\"input\": \"121\", \"expectedOutput\": \"true\"},\n  {\"input\": \"-121\", \"expectedOutput\": \"false\"},\n  {\"input\": \"10\", \"expectedOutput\": \"false\"},\n  {\"input\": \"12321\", \"expectedOutput\": \"true\"}\n]");
        } else {
            if (c.getDescription() == null || c.getDescription().trim().isEmpty() || "Nil".equalsIgnoreCase(c.getDescription().trim())) {
                c.setDescription("Given an array of integers `nums`, calculate and return the sum of all elements in the array.");
            }
            c.setInputFormat("An array of integers `nums`.");
            c.setOutputFormat("A single integer representing the sum of all elements in `nums`.");
            c.setConstraints("• 1 <= nums.length <= 10^4\n• -1000 <= nums[i] <= 1000");
            c.setSampleTestCases("[\n  {\"input\": \"[1, 2, 3, 4, 5]\", \"expectedOutput\": \"15\", \"explanation\": \"1 + 2 + 3 + 4 + 5 = 15.\"},\n  {\"input\": \"[10, -5, 3]\", \"expectedOutput\": \"8\", \"explanation\": \"10 + (-5) + 3 = 8.\"}\n]");
            c.setHiddenTestCases("[\n  {\"input\": \"[1, 2, 3, 4, 5]\", \"expectedOutput\": \"15\"},\n  {\"input\": \"[10, -5, 3]\", \"expectedOutput\": \"8\"},\n  {\"input\": \"[0, 0, 0]\", \"expectedOutput\": \"0\"},\n  {\"input\": \"[-10, -20, -30]\", \"expectedOutput\": \"-60\"}\n]");
        }
    }

    public void createChallenge(ChallengeCreationDto dto, String username) {
        SystemUser setter = null;
        if (username != null) {
            setter = userRepository.findByUsername(username).orElse(null);
        }

        CodingChallenge challenge = new CodingChallenge();
        challenge.setTitle(dto.getTitle());
        challenge.setDescription(dto.getDescription());
        challenge.setDifficulty(dto.getDifficulty());
        challenge.setBasePoints(dto.getBasePoints());
        challenge.setTimeLimitMs(dto.getTimeLimitMs() != null ? dto.getTimeLimitMs() : 1000);
        challenge.setInputFormat(dto.getInputFormat());
        challenge.setOutputFormat(dto.getOutputFormat());
        challenge.setConstraints(dto.getConstraints());
        challenge.setSampleTestCases(dto.getSampleTestCases());
        challenge.setHiddenTestCases(dto.getHiddenTestCases());
        challenge.setStatus("PUBLISHED");
        challenge.setSetter(setter);

        challengeRepository.save(challenge);
    }

    public void updateChallenge(Long id, ChallengeCreationDto dto) {
        CodingChallenge challenge = getChallengeById(id);
        challenge.setTitle(dto.getTitle());
        challenge.setDescription(dto.getDescription());
        challenge.setDifficulty(dto.getDifficulty());
        challenge.setBasePoints(dto.getBasePoints());
        if (dto.getTimeLimitMs() != null) {
            challenge.setTimeLimitMs(dto.getTimeLimitMs());
        }
        if (dto.getInputFormat() != null) challenge.setInputFormat(dto.getInputFormat());
        if (dto.getOutputFormat() != null) challenge.setOutputFormat(dto.getOutputFormat());
        if (dto.getConstraints() != null) challenge.setConstraints(dto.getConstraints());
        if (dto.getSampleTestCases() != null) challenge.setSampleTestCases(dto.getSampleTestCases());
        if (dto.getHiddenTestCases() != null) challenge.setHiddenTestCases(dto.getHiddenTestCases());
        challengeRepository.save(challenge);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteChallenge(Long id) {
        if (!challengeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Challenge not found with id: " + id);
        }
        List<com.example.demo.entity.ChallengeSubmission> submissions = submissionRepository.findByChallengeId(id);
        if (submissions != null && !submissions.isEmpty()) {
            submissionRepository.deleteAll(submissions);
        }
        challengeRepository.deleteById(id);
    }
}
