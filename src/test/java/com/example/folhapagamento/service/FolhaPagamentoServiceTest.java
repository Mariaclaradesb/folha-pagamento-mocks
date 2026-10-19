package com.example.folhapagamento.service;

import com.example.folhapagamento.config.FolhaProperties;
import com.example.folhapagamento.model.FolhaPagamento;
import com.example.folhapagamento.model.Funcionario;
import com.example.folhapagamento.repository.FolhaPagamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.NoSuchElementException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FolhaPagamentoServiceTest {

    private static final YearMonth PERIODO = YearMonth.of(2025, 3);

    @Mock
    private FolhaPagamentoRepository repository;

    @Mock
    private FuncionarioService funcionarioService;

    private FolhaPagamentoService service;

    @BeforeEach
    void configurar() {
        FolhaProperties propriedades = new FolhaProperties(
                new BigDecimal("0.10"), new BigDecimal("0.05"), new BigDecimal("2000.00"));
        service = new FolhaPagamentoService(funcionarioService, repository, propriedades);
    }

    @ParameterizedTest
    @CsvSource({
            "5000, 500.00",
            "1234.56, 123.46"
    })
    void calcularInssAplicaAliquotaEArredondaHalfUp(BigDecimal bruto, BigDecimal esperado) {
        assertEquals(esperado, service.calcularInss(bruto));
    }

    @Test
    void calcularImpostoRendaCobraSobreExcedenteDaIsencao() {
        BigDecimal imposto = service.calcularImpostoRenda(new BigDecimal("5000"), new BigDecimal("500"));

        assertEquals(new BigDecimal("125.00"), imposto);
    }

    @ParameterizedTest
    @CsvSource({
            "2222.22, 222.22",
            "1500, 150"
    })
    void calcularImpostoRendaNaIsencaoOuAbaixoRetornaZero(BigDecimal bruto, BigDecimal inss) {
        assertEquals(new BigDecimal("0.00"), service.calcularImpostoRenda(bruto, inss));
    }

    @Test
    void calcularSalarioLiquidoSubtraiDescontosDoBruto() {
        BigDecimal liquido = service.calcularSalarioLiquido(
                new BigDecimal("5000"), new BigDecimal("500"), new BigDecimal("125"));

        assertEquals(new BigDecimal("4375.00"), liquido);
    }

    @Test
    void calcularSalarioLiquidoComDescontosMaioresQueBrutoLancaExcecao() {
        assertThrows(IllegalArgumentException.class, () -> service.calcularSalarioLiquido(
                new BigDecimal("100"), new BigDecimal("80"), new BigDecimal("50")));
    }

    @ParameterizedTest
    @CsvSource(value = {"NULL", "-1"}, nullValues = "NULL")
    void calcularInssComValorNuloOuNegativoLancaExcecao(BigDecimal valor) {
        assertThrows(IllegalArgumentException.class, () -> service.calcularInss(valor));
    }

    @Test
    void simularDevolveFolhaCalculadaSemIdESemPersistir() {
        Funcionario mateus = new Funcionario(1L, "Mateus", "Desenvolvedor", new BigDecimal("5000.00"));
        when(funcionarioService.buscarPorId(1L)).thenReturn(mateus);

        FolhaPagamento folha = service.simular(1L, PERIODO);

        assertNull(folha.getId());
        assertSame(mateus, folha.getFuncionario());
        assertEquals(PERIODO, folha.getPeriodo());
        assertEquals(new BigDecimal("5000.00"), folha.getSalarioBruto());
        assertEquals(new BigDecimal("500.00"), folha.getDescontoInss());
        assertEquals(new BigDecimal("125.00"), folha.getDescontoImpostoRenda());
        assertEquals(new BigDecimal("4375.00"), folha.getSalarioLiquido());
        verify(repository, never()).save(any());
    }

    @Test
    void gerarPersisteEDevolveFolhaSalva() {
        Funcionario mariaClara = new Funcionario(2L, "Maria Clara", "Analista", new BigDecimal("3000.00"));
        FolhaPagamento salva = new FolhaPagamento(10L, mariaClara, PERIODO, new BigDecimal("3000.00"),
                new BigDecimal("300.00"), new BigDecimal("35.00"), new BigDecimal("2665.00"));
        when(funcionarioService.buscarPorId(2L)).thenReturn(mariaClara);
        when(repository.save(any(FolhaPagamento.class))).thenReturn(salva);

        FolhaPagamento resultado = service.gerar(2L, PERIODO);

        ArgumentCaptor<FolhaPagamento> captor = ArgumentCaptor.forClass(FolhaPagamento.class);
        verify(repository).save(captor.capture());
        assertNull(captor.getValue().getId());
        assertEquals(new BigDecimal("2665.00"), captor.getValue().getSalarioLiquido());
        assertSame(salva, resultado);
    }

    @Test
    void listarPorFuncionarioInexistenteNaoConsultaFolhas() {
        when(funcionarioService.buscarPorId(99L)).thenThrow(new NoSuchElementException("Funcionário não encontrado: 99"));

        assertThrows(NoSuchElementException.class, () -> service.listarPorFuncionario(99L));
        verifyNoInteractions(repository);
    }

    @Test
    void calcularTotalLiquidoSomaFolhasDoPeriodo() {
        Funcionario bruna = new Funcionario(3L, "Bruna", "Analista", new BigDecimal("5000.00"));
        Funcionario mateus = new Funcionario(1L, "Mateus", "Estagiário", new BigDecimal("2000.00"));
        FolhaPagamento folhaBruna = new FolhaPagamento(1L, bruna, PERIODO, new BigDecimal("5000.00"),
                new BigDecimal("500.00"), new BigDecimal("125.00"), new BigDecimal("4375.00"));
        FolhaPagamento folhaMateus = new FolhaPagamento(2L, mateus, PERIODO, new BigDecimal("2000.00"),
                new BigDecimal("200.00"), new BigDecimal("0.00"), new BigDecimal("1800.00"));
        when(repository.findByPeriodoOrderByIdAsc(PERIODO)).thenReturn(List.of(folhaBruna, folhaMateus));

        assertEquals(new BigDecimal("6175.00"), service.calcularTotalLiquido(PERIODO));
    }
}
