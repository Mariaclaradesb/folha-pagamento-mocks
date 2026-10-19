package com.example.folhapagamento.controller;

import com.example.folhapagamento.model.Funcionario;
import com.example.folhapagamento.service.FuncionarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final FuncionarioService service;

    public FuncionarioController(FuncionarioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Funcionario> cadastrar(@RequestBody Funcionario funcionario) {
        Funcionario salvo = service.cadastrar(funcionario);
        return ResponseEntity.created(URI.create("/funcionarios/" + salvo.getId())).body(salvo);
    }

    @GetMapping
    public List<Funcionario> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Funcionario buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public Funcionario editar(@PathVariable Long id, @RequestBody Funcionario funcionario) {
        return service.editar(id, funcionario);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        service.remover(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/salario")
    public Funcionario reajustarSalario(@PathVariable Long id, @RequestParam BigDecimal percentual) {
        return service.reajustarSalario(id, percentual);
    }

    @GetMapping("/cargo/{cargo}")
    public List<Funcionario> buscarPorCargo(@PathVariable String cargo) {
        return service.buscarPorCargo(cargo);
    }

    @GetMapping("/salario-abaixo-de/{limite}")
    public List<Funcionario> buscarPorSalarioAbaixoDe(@PathVariable BigDecimal limite) {
        return service.buscarPorSalarioAbaixoDe(limite);
    }
}
