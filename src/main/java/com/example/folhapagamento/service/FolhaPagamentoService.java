package com.example.folhapagamento.service;

import com.example.folhapagamento.model.FolhaPagamento;
import com.example.folhapagamento.model.Funcionario;
import com.example.folhapagamento.repository.FolhaPagamentoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class FolhaPagamentoService {

    // Regras fictícias, usadas apenas para estudo.
    private static final BigDecimal ALIQUOTA_INSS = new BigDecimal("0.10");
    private static final BigDecimal ALIQUOTA_IR = new BigDecimal("0.05");
    private static final BigDecimal ISENCAO_IR = new BigDecimal("2000.00");

    private final FuncionarioService funcionarioService;
    private final FolhaPagamentoRepository repository;

    public FolhaPagamentoService(FuncionarioService funcionarioService, FolhaPagamentoRepository repository) {
        this.funcionarioService = funcionarioService;
        this.repository = repository;
    }

    public FolhaPagamento gerar(Long funcionarioId, YearMonth periodo) {
        return repository.salvar(simular(funcionarioId, periodo));
    }

    public FolhaPagamento simular(Long funcionarioId, YearMonth periodo) {
        validarPeriodo(periodo);
        Funcionario funcionario = funcionarioService.buscarPorId(funcionarioId);
        BigDecimal bruto = calcularSalarioBruto(funcionario);
        BigDecimal inss = calcularInss(bruto);
        BigDecimal impostoRenda = calcularImpostoRenda(bruto, inss);
        BigDecimal liquido = calcularSalarioLiquido(bruto, inss, impostoRenda);
        return new FolhaPagamento(null, funcionario, periodo, bruto, inss, impostoRenda, liquido);
    }

    public FolhaPagamento buscarPorId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Identificador deve ser positivo");
        }
        return repository.buscarPorId(id)
                .orElseThrow(() -> new NoSuchElementException("Folha de pagamento não encontrada: " + id));
    }

    public List<FolhaPagamento> listarPorFuncionario(Long funcionarioId) {
        funcionarioService.buscarPorId(funcionarioId);
        return repository.buscarPorFuncionarioId(funcionarioId);
    }

    public List<FolhaPagamento> listarPorPeriodo(YearMonth periodo) {
        validarPeriodo(periodo);
        return repository.buscarPorPeriodo(periodo);
    }

    public BigDecimal calcularTotalLiquido(YearMonth periodo) {
        BigDecimal total = listarPorPeriodo(periodo).stream()
                .map(FolhaPagamento::salarioLiquido)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return arredondar(total);
    }

    public BigDecimal calcularSalarioBruto(Funcionario funcionario) {
        if (funcionario == null) {
            throw new IllegalArgumentException("Funcionário é obrigatório");
        }
        validarValor(funcionario.salarioBase());
        return arredondar(funcionario.salarioBase());
    }

    public BigDecimal calcularInss(BigDecimal salarioBruto) {
        validarValor(salarioBruto);
        return arredondar(salarioBruto.multiply(ALIQUOTA_INSS));
    }

    public BigDecimal calcularImpostoRenda(BigDecimal salarioBruto, BigDecimal descontoInss) {
        validarValor(salarioBruto);
        validarValor(descontoInss);
        BigDecimal baseTributavel = salarioBruto.subtract(descontoInss).subtract(ISENCAO_IR);
        return arredondar(baseTributavel.max(BigDecimal.ZERO).multiply(ALIQUOTA_IR));
    }

    public BigDecimal calcularTotalDescontos(BigDecimal inss, BigDecimal impostoRenda) {
        validarValor(inss);
        validarValor(impostoRenda);
        return arredondar(inss.add(impostoRenda));
    }

    public BigDecimal calcularSalarioLiquido(BigDecimal salarioBruto, BigDecimal inss, BigDecimal impostoRenda) {
        validarValor(salarioBruto);
        BigDecimal descontos = calcularTotalDescontos(inss, impostoRenda);
        if (descontos.compareTo(salarioBruto) > 0) {
            throw new IllegalArgumentException("Descontos não podem superar o salário bruto");
        }
        return arredondar(salarioBruto.subtract(descontos));
    }

    private void validarValor(BigDecimal valor) {
        if (valor == null || valor.signum() < 0) {
            throw new IllegalArgumentException("Valor monetário deve ser informado e não pode ser negativo");
        }
    }

    private void validarPeriodo(YearMonth periodo) {
        if (periodo == null) {
            throw new IllegalArgumentException("Período é obrigatório, no formato AAAA-MM");
        }
    }

    private BigDecimal arredondar(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_UP);
    }
}
