using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestaoContratos.Models;

public class Contrato
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Fornecedor { get; set; } = string.Empty;

    [Required, MaxLength(14)]
    public string CnpjFornecedor { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Responsavel { get; set; } = string.Empty;

    [Required]
    public string Descricao { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal Valor { get; set; }

    public DateTime DataInicio { get; set; }
    public DateTime DataVencimento { get; set; }

    public StatusContrato Status { get; set; } = StatusContrato.Ativo;
    public TipoContrato Tipo { get; set; }

    public string? DocumentoUrl { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }

    public bool EstaVencido => DateTime.UtcNow > DataVencimento;
    public bool VenceEm30Dias => !EstaVencido && (DataVencimento - DateTime.UtcNow).TotalDays <= 30;

    public ICollection<AditamentoContrato> Aditamentos { get; set; } = new List<AditamentoContrato>();
}

public enum StatusContrato { Ativo, Encerrado, Suspenso, EmRenovacao }
public enum TipoContrato { Servico, Fornecimento, Locacao, Parceria, Outro }
