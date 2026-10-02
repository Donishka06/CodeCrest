package com.example.demo.service;

import com.example.demo.entity.ContestantProfile;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ContestantProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfileService {

    @Autowired
    private ContestantProfileRepository profileRepository;

    public List<ContestantProfile> getAllProfiles() {
        return profileRepository.findAll();
    }

    public ContestantProfile getProfileByUsername(String username) {
        ContestantProfile profile = profileRepository.findByUsernameIgnoreCase(username)
                .orElseGet(() -> profileRepository.findByUsername(username)
                .orElseGet(() -> {
                    ContestantProfile newP = new ContestantProfile();
                    newP.setUsername(username);
                    newP.setTotalPoints(0);
                    newP.setGlobalRank(0);
                    newP.setAccountStatus("ACTIVE");
                    return profileRepository.save(newP);
                }));

        // Dynamically compute real global standing rank based on total points
        List<ContestantProfile> allContestants = profileRepository.findByUserRoleInOrderByTotalPointsDesc(
                List.of("ROLE_CONTESTANT", "CONTESTANT", "STUDENT"),
                org.springframework.data.domain.PageRequest.of(0, 5000)
        ).getContent();

        if (allContestants.isEmpty()) {
            allContestants = profileRepository.findAllByOrderByTotalPointsDesc(
                    org.springframework.data.domain.PageRequest.of(0, 5000)
            ).getContent();
        }

        int calculatedRank = 1;
        boolean found = false;
        for (int i = 0; i < allContestants.size(); i++) {
            ContestantProfile cp = allContestants.get(i);
            if (cp.getUsername() != null && cp.getUsername().equalsIgnoreCase(profile.getUsername())) {
                calculatedRank = i + 1;
                found = true;
                break;
            }
        }

        if (!found) {
            calculatedRank = allContestants.size() + 1;
        }

        profile.setGlobalRank(calculatedRank);
        return profileRepository.save(profile);
    }

    public void updateProfile(Long id, ContestantProfile details) {
        ContestantProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with id: " + id));
        if (details.getFullName() != null) {
            profile.setFullName(details.getFullName());
        }
        if (details.getCollege() != null) {
            profile.setCollege(details.getCollege());
        }
        if (details.getProgrammingLanguages() != null) {
            profile.setProgrammingLanguages(details.getProgrammingLanguages());
        }
        if (details.getBio() != null) {
            profile.setBio(details.getBio());
        }
        if (details.getAccountStatus() != null) {
            profile.setAccountStatus(details.getAccountStatus());
        }
        if (details.getProfilePicture() != null) {
            profile.setProfilePicture(details.getProfilePicture().trim().isEmpty() ? null : details.getProfilePicture());
        }
        profileRepository.save(profile);
    }

    public void deleteProfile(Long id) {
        if (!profileRepository.existsById(id)) {
            throw new ResourceNotFoundException("Profile not found with id: " + id);
        }
        profileRepository.deleteById(id);
    }
}
