package com.example.demo.controller;

import com.example.demo.dto.AddContestQuestionsRequestDto;
import com.example.demo.dto.AiGeneratedQuestionDto;
import com.example.demo.dto.AiQuestionGenerateRequestDto;
import com.example.demo.entity.CodingChallenge;
import com.example.demo.entity.ProgrammingContest;
import com.example.demo.entity.SystemUser;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CodingChallengeRepository;
import com.example.demo.repository.ProgrammingContestRepository;
import com.example.demo.repository.SystemUserRepository;
import com.example.demo.service.AiQuestionGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class AiContestQuestionController {

    private final AiQuestionGenerationService aiGenerationService;
    private final CodingChallengeRepository challengeRepository;
    private final ProgrammingContestRepository contestRepository;
    private final SystemUserRepository userRepository;

    @Autowired
    public AiContestQuestionController(
            AiQuestionGenerationService aiGenerationService,
            CodingChallengeRepository challengeRepository,
            ProgrammingContestRepository contestRepository,
            SystemUserRepository userRepository) {
        this.aiGenerationService = aiGenerationService;
        this.challengeRepository = challengeRepository;
        this.contestRepository = contestRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/ai/generate-questions")
    public ResponseEntity<List<AiGeneratedQuestionDto>> generateQuestions(@RequestBody AiQuestionGenerateRequestDto req) {
        List<AiGeneratedQuestionDto> generated = aiGenerationService.generateQuestions(req);
        return ResponseEntity.ok(generated);
    }

    @PostMapping("/contests/{contestId}/add-questions")
    public ResponseEntity<?> addQuestionsToContest(
            @PathVariable Long contestId,
            @RequestBody com.fasterxml.jackson.databind.JsonNode requestNode,
            Principal principal) {

        ProgrammingContest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + contestId));

        String username = principal != null && principal.getName() != null && !principal.getName().isEmpty()
                ? principal.getName()
                : "setter";

        SystemUser setter = userRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> userRepository.findByUsername(username)
                .orElse(null));

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.configure(com.fasterxml.jackson.databind.MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true);
        List<AiGeneratedQuestionDto> questions = new ArrayList<>();
        if (requestNode != null) {
            com.fasterxml.jackson.databind.JsonNode qNode = requestNode.has("questions") ? requestNode.get("questions") : requestNode;
            if (qNode.has("value")) {
                qNode = qNode.get("value");
            }
            if (qNode.isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode elem : qNode) {
                    questions.add(mapper.convertValue(elem, AiGeneratedQuestionDto.class));
                }
            } else if (qNode.isObject()) {
                if (qNode.has("title")) {
                    questions.add(mapper.convertValue(qNode, AiGeneratedQuestionDto.class));
                } else {
                    for (com.fasterxml.jackson.databind.JsonNode child : qNode) {
                        if (child.isArray()) {
                            for (com.fasterxml.jackson.databind.JsonNode sub : child) {
                                if (sub.isObject() && sub.has("title")) {
                                    questions.add(mapper.convertValue(sub, AiGeneratedQuestionDto.class));
                                }
                            }
                        } else if (child.isObject() && child.has("title")) {
                            questions.add(mapper.convertValue(child, AiGeneratedQuestionDto.class));
                        }
                    }
                }
            }
        }

        List<CodingChallenge> saved = new ArrayList<>();

        for (AiGeneratedQuestionDto dto : questions) {
            CodingChallenge c = new CodingChallenge();
            c.setTitle(dto.getTitle() != null ? dto.getTitle().trim() : "Untitled Challenge");
            c.setDescription(dto.getDescription() != null ? dto.getDescription().trim() : "");
            c.setInputFormat(dto.getInputFormat() != null ? dto.getInputFormat().trim() : "");
            c.setOutputFormat(dto.getOutputFormat() != null ? dto.getOutputFormat().trim() : "");
            c.setConstraints(dto.getConstraints() != null ? dto.getConstraints().trim() : "");
            c.setSampleTestCases(dto.getSampleTestCases());
            c.setHiddenTestCases(dto.getHiddenTestCases());
            c.setDifficulty(dto.getDifficulty() != null ? dto.getDifficulty().trim().toUpperCase() : "EASY");
            c.setBasePoints(dto.getBasePoints() != null ? dto.getBasePoints() : 100);
            c.setTimeLimitMs(dto.getTimeLimitMs() != null ? dto.getTimeLimitMs() : 1000);

            // Crucial: Do not automatically publish. Save as DRAFT.
            c.setStatus("DRAFT");
            c.setContest(contest);
            if (setter != null) {
                c.setSetter(setter);
            }

            saved.add(challengeRepository.save(c));
        }

        return ResponseEntity.ok(java.util.Map.of(
                "message", "Successfully added " + saved.size() + " draft questions to contest: " + contest.getTitle(),
                "count", saved.size(),
                "contestId", contest.getId()
        ));
    }

    @GetMapping("/contests/{contestId}/questions")
    public ResponseEntity<List<CodingChallenge>> getContestQuestions(@PathVariable Long contestId) {
        if (!contestRepository.existsById(contestId)) {
            throw new ResourceNotFoundException("Contest not found with id: " + contestId);
        }
        List<CodingChallenge> challenges = challengeRepository.findByContestId(contestId);
        return ResponseEntity.ok(challenges);
    }
}
