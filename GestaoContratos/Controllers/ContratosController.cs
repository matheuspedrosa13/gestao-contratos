using GestaoContratos.Data;
using GestaoContratos.DTOs;
using GestaoContratos.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GestaoContratos.Controllers;

[ApiController]
[Route("api/v1/contratos")]
public class ContratosController : ControllerBase
{
    private readonly AppDbContext _db;

    public ContratosController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? status, [FromQuery] bool? vencendoEm30Dias)
    {
        var query = _db.Contratos.Include(c => c.Aditamentos).AsQueryable();

        if (status is not null && Enum.TryParse<StatusContrato>(status, out var s))
            query = query.Where(c => c.Status == s);

        var contratos = await query.OrderByDescending(c => c.CriadoEm).ToListAsync();

        if (vencendoEm30Dias == true)
            contratos = contratos.Where(c => c.VenceEm30Dias).ToList();

        return Ok(contratos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Buscar(int id)
    {
        var contrato = await _db.Contratos.Include(c => c.Aditamentos).FirstOrDefaultAsync(c => c.Id == id);
        return contrato is null ? NotFound() : Ok(contrato);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] CriarContratoDto dto)
    {
        var contrato = new Contrato
        {
            Titulo = dto.Titulo,
            Fornecedor = dto.Fornecedor,
            CnpjFornecedor = dto.CnpjFornecedor,
            Responsavel = dto.Responsavel,
            Descricao = dto.Descricao,
            Valor = dto.Valor,
            DataInicio = dto.DataInicio,
            DataVencimento = dto.DataVencimento,
            Tipo = (TipoContrato)dto.Tipo,
            DocumentoUrl = dto.DocumentoUrl
        };

        _db.Contratos.Add(contrato);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Buscar), new { id = contrato.Id }, contrato);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> AtualizarStatus(int id, [FromBody] AtualizarStatusDto dto)
    {
        var contrato = await _db.Contratos.FindAsync(id);
        if (contrato is null) return NotFound();

        contrato.Status = (StatusContrato)dto.Status;
        contrato.AtualizadoEm = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(contrato);
    }

    [HttpPost("{id:int}/aditamentos")]
    public async Task<IActionResult> AdicionarAditamento(int id, [FromBody] CriarAditamentoDto dto)
    {
        var contrato = await _db.Contratos.FindAsync(id);
        if (contrato is null) return NotFound();

        var aditamento = new AditamentoContrato
        {
            ContratoId = id,
            Descricao = dto.Descricao,
            NovoValor = dto.NovoValor,
            NovaDataVencimento = dto.NovaDataVencimento
        };

        if (dto.NovoValor.HasValue) contrato.Valor = dto.NovoValor.Value;
        if (dto.NovaDataVencimento.HasValue) contrato.DataVencimento = dto.NovaDataVencimento.Value;
        contrato.AtualizadoEm = DateTime.UtcNow;

        _db.Aditamentos.Add(aditamento);
        await _db.SaveChangesAsync();
        return Ok(aditamento);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remover(int id)
    {
        var contrato = await _db.Contratos.FindAsync(id);
        if (contrato is null) return NotFound();
        _db.Contratos.Remove(contrato);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("alertas")]
    public async Task<IActionResult> Alertas()
    {
        var contratos = await _db.Contratos.Where(c => c.Status == StatusContrato.Ativo).ToListAsync();
        return Ok(new
        {
            vencidos = contratos.Where(c => c.EstaVencido).ToList(),
            vencendoEm30Dias = contratos.Where(c => c.VenceEm30Dias).ToList()
        });
    }
}
