package com.example.auth;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
class AuthResourceTest {

    @Test
    void testLoginWithKnownUser() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"username\":\"admin\",\"password\":\"any\"}")
          .when().post("/api/auth/login")
          .then()
             .statusCode(200)
             .body("message", is("Login successful"));
    }

    @Test
    void testLoginWithUnknownUser() {
        given()
            .contentType(ContentType.JSON)
            .body("{\"username\":\"unknown\",\"password\":\"any\"}")
          .when().post("/api/auth/login")
          .then()
             .statusCode(401)
             .body("message", is("Invalid username or password"));
    }
}
