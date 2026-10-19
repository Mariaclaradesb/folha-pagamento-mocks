package com.example.folhapagamento.service;

import com.example.folhapagamento.model.Funcionario;
import com.example.folhapagamento.repository.FuncionarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FuncionarioServiceTest {

    @Mock
    private FuncionarioRepository repository;

    @InjectMocks
    private FuncionarioService service;

    static Stream<Funcionario> funcionariosInvalidos() {
        BigDecimal salario = new BigDecimal("5500.00");
        return Stream.of(
                new Funcionario(null, "   ", "Analista", salario),
                new Funcionario(null, "Maria Clara", "   ", salario),
                new Funcionario(null, "Maria Clara", "Analista", null),
                new Funcionario(null, "Maria Clara", "Analista", new BigDecimal("0.00")));
    }

    @Test
    void cadastrarNormalizaNomeCargoESalario() {
        Funcionario entrada = new Funcionario(99L, "  Mateus ", " Desenvolvedor ", new BigDecimal("5000"));
        when(repository.save(any(Funcionario.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        service.cadastrar(entrada);

        ArgumentCaptor<Funcionario> captor = ArgumentCaptor.forClass(Funcionario.class);
        verify(repository).save(captor.capture());
        Funcionario salvo = captor.getValue();
        assertNull(salvo.getId());
        assertEquals("Mateus", salvo.getNome());
        assertEquals("Desenvolvedor", salvo.getCargo());
        assertEquals(new BigDecimal("5000.00"), salvo.getSalarioBase());
    }

    @ParameterizedTest
    @MethodSource("funcionariosInvalidos")
    void cadastrarComDadosInvalidosLancaExcecao(Funcionario invalido) {
        assertThrows(IllegalArgumentException.class, () -> service.cadastrar(invalido));
        verifyNoInteractions(repository);
    }

    @Test
    void editarInexistenteNaoChamaSave() {
        Funcionario bruna = new Funcionario(null, "Bruna", "Analista", new BigDecimal("6000.00"));
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.editar(99L, bruna));
        verify(repository, never()).save(any());
    }

    @Test
    void removerInexistenteNaoChamaDeleteById() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.remover(99L));
        verify(repository, never()).deleteById(any());
    }

    @Test
    void reajustarSalarioAplicaPercentual() {
        Funcionario mariaClara = new Funcionario(1L, "Maria Clara", "Analista", new BigDecimal("5500.00"));
        when(repository.findById(1L)).thenReturn(Optional.of(mariaClara));
        when(repository.save(any(Funcionario.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        service.reajustarSalario(1L, new BigDecimal("10"));

        ArgumentCaptor<Funcionario> captor = ArgumentCaptor.forClass(Funcionario.class);
        verify(repository).save(captor.capture());
        Funcionario reajustado = captor.getValue();
        assertEquals(1L, reajustado.getId());
        assertEquals("Maria Clara", reajustado.getNome());
        assertEquals("Analista", reajustado.getCargo());
        assertEquals(new BigDecimal("6050.00"), reajustado.getSalarioBase());
    }

    @ParameterizedTest
    @CsvSource(value = {"NULL", "0", "-5"}, nullValues = "NULL")
    void reajustarSalarioComPercentualInvalidoLancaExcecao(BigDecimal percentual) {
        assertThrows(IllegalArgumentException.class, () -> service.reajustarSalario(1L, percentual));
        verifyNoInteractions(repository);
    }

    @Test
    void buscarPorIdInexistenteLancaNoSuchElement() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> service.buscarPorId(99L));
    }

    @Test
    void buscarPorCargoRemoveEspacosAntesDeConsultar() {
        service.buscarPorCargo("  Desenvolvedor ");

        verify(repository).findByCargoIgnoreCaseOrderByIdAsc("Desenvolvedor");
    }
}
