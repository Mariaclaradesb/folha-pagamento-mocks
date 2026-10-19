package com.example.folhapagamento.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;

@ConfigurationProperties(prefix = "folha")
public record FolhaProperties(BigDecimal aliquotaInss, BigDecimal aliquotaIr, BigDecimal isencaoIr) {
}
