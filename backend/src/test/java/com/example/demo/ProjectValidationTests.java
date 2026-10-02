package com.example.demo;

import org.testng.Assert;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
import java.lang.reflect.*;
import java.util.*;

@Listeners(TestResultListener.class)
public class ProjectValidationTests {

    // =====================================================================================
    // CATEGORY 1: Folder Structure & Package Verification
    // =====================================================================================
    @Test
    public void t01_folderAuthController() throws Exception {
        // SRS_REF: Controller Layer - AuthController
        Assert.assertNotNull(Class.forName("com.example.demo.controller.AuthController"));
    }

    @Test
    public void t02_folderChallengeService() throws Exception {
        // SRS_REF: Service Layer - ChallengeService
        Assert.assertNotNull(Class.forName("com.example.demo.service.ChallengeService"));
    }

    @Test
    public void t03_folderUserRepository() throws Exception {
        // SRS_REF: Repositories - SystemUserRepository
        Assert.assertNotNull(Class.forName("com.example.demo.repository.SystemUserRepository"));
    }

    @Test
    public void t04_folderUserEntity() throws Exception {
        // SRS_REF: Entity Models - SystemUser
        Assert.assertNotNull(Class.forName("com.example.demo.entity.SystemUser"));
    }

    @Test
    public void t05_folderSecurityJwt() throws Exception {
        // SRS_REF: Security Implementation - JwtUtil
        Assert.assertNotNull(Class.forName("com.example.demo.security.JwtUtil"));
    }

    // =====================================================================================
    // CATEGORY 2: The Unified Logic Stack - Path + Status + Body
    // =====================================================================================
    @Test
    public void t06_authLoginLogic() throws Exception {
        // SRS_REF: Controller Layer - AuthController POST /login
        Class<?> clazz = Class.forName("com.example.demo.controller.AuthController");
        Class<?> requestDtoClass = Class.forName("com.example.demo.dto.AuthRequestDto");
        Method m = clazz.getDeclaredMethod("login", requestDtoClass);
        String path = clazz.getAnnotation(RequestMapping.class).value()[0]
                + m.getAnnotation(PostMapping.class).value()[0];
        Assert.assertEquals(path, "/api/auth/login");
    }

    @Test
    public void t07_authRegisterLogic() throws Exception {
        // SRS_REF: Controller Layer - AuthController POST /register
        Class<?> clazz = Class.forName("com.example.demo.controller.AuthController");
        Class<?> registerDtoClass = Class.forName("com.example.demo.dto.RegisterDto");
        Method m = clazz.getDeclaredMethod("register", registerDtoClass);
        String path = clazz.getAnnotation(RequestMapping.class).value()[0]
                + m.getAnnotation(PostMapping.class).value()[0];
        Assert.assertEquals(path, "/api/auth/register");
    }

    @Test
    public void t08_profileUpdateLogic() throws Exception {
        // SRS_REF: Controller Layer - ProfileController PUT /{id}
        Class<?> clazz = Class.forName("com.example.demo.controller.ProfileController");
        Class<?> profileClass = Class.forName("com.example.demo.entity.ContestantProfile");
        Method m = clazz.getDeclaredMethod("update", Long.class, profileClass);
        String path = clazz.getAnnotation(RequestMapping.class).value()[0]
                + m.getAnnotation(PutMapping.class).value()[0];
        Assert.assertEquals(path, "/api/profiles/{id}");
    }

    @Test
    public void t09_profileListLogic() throws Exception {
        // SRS_REF: Controller Layer - ProfileController GET /
        Class<?> clazz = Class.forName("com.example.demo.controller.ProfileController");
        Method m = clazz.getDeclaredMethod("getAll");
        String path = clazz.getAnnotation(RequestMapping.class).value()[0];
        Assert.assertEquals(path, "/api/profiles");
        Assert.assertTrue(m.isAnnotationPresent(GetMapping.class));
    }

    @Test
    public void t10_challengeListLogic() throws Exception {
        // SRS_REF: Controller Layer - ChallengeController GET /
        Class<?> clazz = Class.forName("com.example.demo.controller.ChallengeController");
        Method m = clazz.getDeclaredMethod("getAll", Pageable.class);
        Assert.assertEquals(clazz.getAnnotation(RequestMapping.class).value()[0], "/api/challenges");
    }

    @Test
    public void t11_challengeCreateLogic() throws Exception {
        // SRS_REF: Controller Layer - ChallengeController POST /
        Class<?> clazz = Class.forName("com.example.demo.controller.ChallengeController");
        Class<?> creationDtoClass = Class.forName("com.example.demo.dto.ChallengeCreationDto");
        Method m = clazz.getDeclaredMethod("create", creationDtoClass, java.security.Principal.class);
        Assert.assertTrue(m.isAnnotationPresent(PostMapping.class));
    }

    @Test
    public void t12_challengeDeleteLogic() throws Exception {
        // SRS_REF: Controller Layer - ChallengeController DELETE /{id}
        Class<?> ctrlClass = Class.forName("com.example.demo.controller.ChallengeController");
        Class<?> serviceClass = Class.forName("com.example.demo.service.ChallengeService");
        
        Object serviceMock = org.mockito.Mockito.mock(serviceClass);
        
        Constructor<?> ctrlConstructor = ctrlClass.getDeclaredConstructors()[0];
        Object[] constructorArgs = new Object[ctrlConstructor.getParameterCount()];
        for (int i = 0; i < constructorArgs.length; i++) {
            Class<?> paramType = ctrlConstructor.getParameterTypes()[i];
            if (paramType.equals(serviceClass)) {
                constructorArgs[i] = serviceMock;
            } else {
                constructorArgs[i] = org.mockito.Mockito.mock(paramType);
            }
        }
        Object controller = ctrlConstructor.newInstance(constructorArgs);
        
        Method deleteMethod = ctrlClass.getMethod("delete", Long.class);
        ResponseEntity<?> resp = (ResponseEntity<?>) deleteMethod.invoke(controller, 1L);
        Assert.assertEquals(resp.getBody(), "Challenge deleted");
        
        Collection<org.mockito.invocation.Invocation> invocations = org.mockito.Mockito.mockingDetails(serviceMock).getInvocations();
        boolean methodCalled = false;
        for (org.mockito.invocation.Invocation inv : invocations) {
            if (inv.getMethod().getName().equals("deleteChallenge")) {
                methodCalled = true;
                break;
            }
        }
        Assert.assertTrue(methodCalled, "Service method should be called");
    }

    @Test
    public void t13_contestCreateLogic() throws Exception {
        // SRS_REF: Controller Layer - ContestController POST /
        Class<?> clazz = Class.forName("com.example.demo.controller.ContestController");
        Class<?> contestClass = Class.forName("com.example.demo.entity.ProgrammingContest");
        Method m = clazz.getDeclaredMethod("create", contestClass);
        Assert.assertTrue(m.isAnnotationPresent(PostMapping.class));
    }

    @Test
    public void t14_contestDeleteLogic() throws Exception {
        // SRS_REF: Controller Layer - ContestController DELETE /{id}
        Class<?> ctrlClass = Class.forName("com.example.demo.controller.ContestController");
        Class<?> serviceClass = Class.forName("com.example.demo.service.ContestService");
        
        Object serviceMock = org.mockito.Mockito.mock(serviceClass);
        
        Constructor<?> ctrlConstructor = ctrlClass.getDeclaredConstructors()[0];
        Object[] constructorArgs = new Object[ctrlConstructor.getParameterCount()];
        for (int i = 0; i < constructorArgs.length; i++) {
            Class<?> paramType = ctrlConstructor.getParameterTypes()[i];
            if (paramType.equals(serviceClass)) {
                constructorArgs[i] = serviceMock;
            } else {
                constructorArgs[i] = org.mockito.Mockito.mock(paramType);
            }
        }
        Object controller = ctrlConstructor.newInstance(constructorArgs);
        
        Method deleteMethod = ctrlClass.getMethod("delete", Long.class);
        ResponseEntity<?> resp = (ResponseEntity<?>) deleteMethod.invoke(controller, 1L);
        Assert.assertEquals(resp.getBody(), "Contest deleted");
        
        Collection<org.mockito.invocation.Invocation> invocations = org.mockito.Mockito.mockingDetails(serviceMock).getInvocations();
        boolean methodCalled = false;
        for (org.mockito.invocation.Invocation inv : invocations) {
            if (inv.getMethod().getName().equals("deleteContest")) {
                methodCalled = true;
                break;
            }
        }
        Assert.assertTrue(methodCalled, "Service method should be called");
    }

    @Test
    public void t15_contestListLogic() throws Exception {
        // SRS_REF: Controller Layer - ContestController GET /
        Class<?> clazz = Class.forName("com.example.demo.controller.ContestController");
        Method m = clazz.getDeclaredMethod("getAllContests", Pageable.class);
        Assert.assertEquals(clazz.getAnnotation(RequestMapping.class).value()[0], "/api/contests");
    }

    @Test
    public void t16_submissionListLogic() throws Exception {
        // SRS_REF: Controller Layer - SubmissionController GET /
        Class<?> clazz = Class.forName("com.example.demo.controller.SubmissionController");
        Method m = clazz.getDeclaredMethod("getAll", Pageable.class);
        Assert.assertEquals(clazz.getAnnotation(RequestMapping.class).value()[0], "/api/submissions");
    }

    @Test
    public void t17_submissionSubmitLogic() throws Exception {
        // SRS_REF: Controller Layer - ChallengeController POST /{id}/submit
        Class<?> clazz = Class.forName("com.example.demo.controller.ChallengeController");
        Class<?> submissionDtoClass = Class.forName("com.example.demo.dto.SubmissionRequestDto");
        Method m = clazz.getDeclaredMethod("submit", Long.class, submissionDtoClass, java.security.Principal.class);
        Assert.assertTrue(m.isAnnotationPresent(PostMapping.class));
    }

    @Test
    public void t18_leaderboardLogic() throws Exception {
        // SRS_REF: Controller Layer - LeaderboardController GET /global
        Class<?> clazz = Class.forName("com.example.demo.controller.LeaderboardController");
        Method m = clazz.getDeclaredMethod("getGlobal", Pageable.class);
        Assert.assertEquals(clazz.getAnnotation(RequestMapping.class).value()[0], "/api/leaderboard");
    }

    // =====================================================================================
    // CATEGORY 3: Repository Logic
    // =====================================================================================
    @Test
    public void t19_repositoryInheritanceLogic() throws Exception {
        // SRS_REF: Repositories - SystemUserRepository JpaRepository
        Assert.assertTrue(org.springframework.data.jpa.repository.JpaRepository.class
                .isAssignableFrom(Class.forName("com.example.demo.repository.SystemUserRepository")));
    }

    @Test
    public void t20_repositoryCustomLogic() throws Exception {
        // SRS_REF: Repositories - SystemUserRepository findByUsername
        Assert.assertEquals(Class.forName("com.example.demo.repository.SystemUserRepository")
                .getDeclaredMethod("findByUsername", String.class).getReturnType(), Optional.class);
    }

    // =====================================================================================
    // CATEGORY 4: Exception logic
    // =====================================================================================
    @Test
    public void t21_exceptionHandlerAdviceLogic() throws Exception {
        // SRS_REF: Exception Handling - GlobalExceptionHandler @ControllerAdvice
        Assert.assertTrue(Class.forName("com.example.demo.exception.GlobalExceptionHandler")
                .isAnnotationPresent(org.springframework.web.bind.annotation.ControllerAdvice.class));
    }

    @Test
    @SuppressWarnings("unchecked")
    public void t22_resourceNotFoundLogic() throws Exception {
        // SRS_REF: Exception Handling - ResourceNotFoundException
        Class<?> handlerClass = Class.forName("com.example.demo.exception.GlobalExceptionHandler");
        Class<?> exClass = Class.forName("com.example.demo.exception.ResourceNotFoundException");
        Method m = handlerClass.getDeclaredMethod("handleResourceNotFoundException", exClass);
        Object handler = handlerClass.getDeclaredConstructor().newInstance();
        Object exception = exClass.getDeclaredConstructor(String.class).newInstance("Msg");
        ResponseEntity<Map<String, Object>> resp = (ResponseEntity<Map<String, Object>>) m.invoke(handler, exception);
        Assert.assertEquals(((Map<String, Object>)resp.getBody()).get("message"), "Msg");
    }

    @Test
    @SuppressWarnings("unchecked")
    public void t23_businessValidationErrorLogic() throws Exception {
        // SRS_REF: Exception Handling - BusinessValidationException
        Class<?> handlerClass = Class.forName("com.example.demo.exception.GlobalExceptionHandler");
        Class<?> exClass = Class.forName("com.example.demo.exception.BusinessValidationException");
        Method m = handlerClass.getDeclaredMethod("handleBusinessValidationException", exClass);
        Object handler = handlerClass.getDeclaredConstructor().newInstance();
        Object exception = exClass.getDeclaredConstructor(String.class).newInstance("Msg");
        ResponseEntity<Map<String, Object>> resp = (ResponseEntity<Map<String, Object>>) m.invoke(handler, exception);
        Assert.assertEquals(((Map<String, Object>)resp.getBody()).get("message"), "Msg");
    }

    // =====================================================================================
    // CATEGORY 5: JWT Logic
    // =====================================================================================
    @Test
    public void t24_jwtGenerateLogic() throws Exception {
        // SRS_REF: Utility Classes - JwtUtil generateToken
        Assert.assertEquals(
                Class.forName("com.example.demo.security.JwtUtil")
                        .getDeclaredMethod("generateToken",
                                org.springframework.security.core.userdetails.UserDetails.class)
                        .getReturnType(),
                String.class);
    }

    @Test
    public void t25_jwtValidateLogic() throws Exception {
        // SRS_REF: Utility Classes - JwtUtil validateToken
        Assert.assertEquals(Class.forName("com.example.demo.security.JwtUtil")
                .getDeclaredMethod("isTokenValid", String.class, org.springframework.security.core.userdetails.UserDetails.class)
                .getReturnType(), boolean.class);
    }

    @Test
    public void t26_jwtSecretLogic() throws Exception {
        // SRS_REF: Security Implementation - JwtUtil secretKey
        Assert.assertNotNull(Class.forName("com.example.demo.security.JwtUtil").getDeclaredField("secretKey"));
    }

    // =====================================================================================
    // CATEGORY 6: Entity Mapping Logic
    // =====================================================================================
    @Test
    public void t27_entityUserLogic() throws Exception {
        // SRS_REF: Entity Models - SystemUser @Table
        Assert.assertEquals(
                Class.forName("com.example.demo.entity.SystemUser").getAnnotation(jakarta.persistence.Table.class).name(),
                "system_users");
    }

    @Test
    public void t28_entityChallengeLogic() throws Exception {
        // SRS_REF: Entity Models - CodingChallenge @Table
        Assert.assertEquals(Class.forName("com.example.demo.entity.CodingChallenge")
                .getAnnotation(jakarta.persistence.Table.class).name(), "coding_challenges");
    }

    // =====================================================================================
    // CATEGORY 7: Security Config Logic
    // =====================================================================================
    @Test
    public void t29_securityEncoderLogic() throws Exception {
        // SRS_REF: Security Implementation - SecurityConfig passwordEncoder Bean
        Assert.assertTrue(Class.forName("com.example.demo.config.SecurityConfig").getDeclaredMethod("passwordEncoder")
                .isAnnotationPresent(org.springframework.context.annotation.Bean.class));
    }

    @Test
    public void t30_securityFilterChainLogic() throws Exception {
        // SRS_REF: Security Implementation - SecurityConfig securityFilterChain Bean
        Assert.assertTrue(Class.forName("com.example.demo.config.SecurityConfig")
                .getDeclaredMethod("securityFilterChain",
                        org.springframework.security.config.annotation.web.builders.HttpSecurity.class)
                .isAnnotationPresent(org.springframework.context.annotation.Bean.class));
    }
}
