package com.example.folhapagamento.controller;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;

import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ApiExceptionHandlerTest {

    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    void tratarRecursoNaoEncontradoRetorna404ComMensagemDaExcecao() {
        NoSuchElementException excecao = new NoSuchElementException("Funcionário não encontrado: 99");

        ProblemDetail problema = handler.tratarRecursoNaoEncontrado(excecao);

        assertEquals(HttpStatus.NOT_FOUND.value(), problema.getStatus());
        assertEquals("Funcionário não encontrado: 99", problema.getDetail());
    }

    @Test
    void tratarValidacaoRetorna400ComMensagemDaExcecao() {
        IllegalArgumentException excecao = new IllegalArgumentException("Nome é obrigatório");

        ProblemDetail problema = handler.tratarValidacao(excecao);

        assertEquals(HttpStatus.BAD_REQUEST.value(), problema.getStatus());
        assertEquals("Nome é obrigatório", problema.getDetail());
    }

    @Test
    void tratarConflitoDeIntegridadeRetorna409() {
        ProblemDetail problema = handler.tratarConflitoDeIntegridade();

        assertEquals(HttpStatus.CONFLICT.value(), problema.getStatus());
    }
}
