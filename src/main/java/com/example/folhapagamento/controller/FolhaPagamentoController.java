package com.example.folhapagamento.controller;

import com.example.folhapagamento.dto.GerarFolhaPagamentoRequest;
import com.example.folhapagamento.model.FolhaPagamento;
import com.example.folhapagamento.service.FolhaPagamentoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.net.URI;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/folhas-pagamento")
public class FolhaPagamentoController {

    private final FolhaPagamentoService service;

    public FolhaPagamentoController(FolhaPagamentoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<FolhaPagamento> gerar(@RequestBody GerarFolhaPagamentoRequest request) {
        FolhaPagamento folha = service.gerar(request.funcionarioId(), request.periodo());
        return ResponseEntity.created(URI.create("/folhas-pagamento/" + folha.id())).body(folha);
    }

    @PostMapping("/simulacao")
    public FolhaPagamento simular(@RequestBody GerarFolhaPagamentoRequest request) {
        return service.simular(request.funcionarioId(), request.periodo());
    }

    @GetMapping("/{id}")
    public FolhaPagamento buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/funcionario/{funcionarioId}")
    public List<FolhaPagamento> listarPorFuncionario(@PathVariable Long funcionarioId) {
        return service.listarPorFuncionario(funcionarioId);
    }

    @GetMapping("/periodo/{periodo}")
    public List<FolhaPagamento> listarPorPeriodo(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM") YearMonth periodo) {
        return service.listarPorPeriodo(periodo);
    }

    @GetMapping("/periodo/{periodo}/total-liquido")
    public BigDecimal calcularTotalLiquido(
            @PathVariable @DateTimeFormat(pattern = "yyyy-MM") YearMonth periodo) {
        return service.calcularTotalLiquido(periodo);
    }
}
