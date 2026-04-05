using System.ComponentModel.DataAnnotations;

namespace GestaoContratos.Models;

public class AditamentoContrato
{
    [Key]
    public int Id { get; set; }

    public int ContratoId { get; set; }
    public Contrato Contrato { get; set; } = null!;

    [Required, MaxLength(200)]
    public string Descricao { get; set; } = string.Empty;

    public decimal? NovoValor { get; set; }
    public DateTime? NovaDataVencimento { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
