using System.ComponentModel.DataAnnotations;

namespace GestaoContratos.DTOs;

public record CriarContratoDto(
    [Required, MaxLength(200)] string Titulo,
    [Required, MaxLength(200)] string Fornecedor,
    [Required] string CnpjFornecedor,
    [Required, MaxLength(200)] string Responsavel,
    [Required] string Descricao,
    decimal Valor,
    DateTime DataInicio,
    DateTime DataVencimento,
    int Tipo,
    string? DocumentoUrl
);

public record AtualizarStatusDto([Required] int Status);

public record CriarAditamentoDto(
    [Required] string Descricao,
    decimal? NovoValor,
    DateTime? NovaDataVencimento
);
