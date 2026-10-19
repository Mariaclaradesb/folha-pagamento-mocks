package com.example.folhapagamento.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.YearMonth;

@Converter
public class YearMonthConverter implements AttributeConverter<YearMonth, String> {

    @Override
    public String convertToDatabaseColumn(YearMonth periodo) {
        return periodo == null ? null : periodo.toString();
    }

    @Override
    public YearMonth convertToEntityAttribute(String valor) {
        return valor == null ? null : YearMonth.parse(valor);
    }
}
