using InventoryFinalProject.Models;
using InventoryFinalProject.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace InventoryFinalProject.Controllers
{
    [RoutePrefix("api/invoicedetails")]
    [EnableCors(origins: "*", headers: "*", methods: "*")]

    public class InvoiceDetailController:ApiController
    {
        private readonly InvoiceDetailRepository _repository;
        public InvoiceDetailController()
        {
            _repository= new InvoiceDetailRepository();
        }
        
        [HttpPost]
        [Route("InsertDetail")]
        public IHttpActionResult InsertInvoiceDetail([FromBody] InvoiceDetail invoiceDetail)
        {
            if (invoiceDetail == null || invoiceDetail.FkIhSeq <= 0 || invoiceDetail.IdQty <= 0 || invoiceDetail.IdPrice <= 0)
            {
                return BadRequest("Invalid input data.");
            }

            int detailSeq = _repository.InsertInvoiceDetail(invoiceDetail);
            if (detailSeq <= 0)
            {
                return BadRequest("Failed to insert invoice detail.");
            }
            return Ok(new { DetailSeq = detailSeq });
        }
        [HttpPost]
        [Route("UpdateDetail")]
        public IHttpActionResult UpdateInvoiceDetail([FromBody] UpdateInvoiceDetailRequest request)
        {
            if (request == null || request.IdSeq <= 0 || string.IsNullOrWhiteSpace(request.ItemName) || request.Qty <= 0 || request.Price <= 0)
            {
                return BadRequest("Invalid parameters.");
            }

            bool success = _repository.UpdateInvoiceDetail(request.IdSeq, request.ItemName, request.Qty, request.Price, out decimal updatedTotal);
            if (success)
            {
                return Ok(new { Message = "Invoice detail updated successfully.", UpdatedTotal = updatedTotal });
            }
            else
            {
                return BadRequest("Failed to update invoice detail.");
            }
        }

        [HttpPost]
        [Route("DeleteDetail/{IdSeq}")]
        public IHttpActionResult DeleteInvoiceDetail(int IdSeq)
        {
            if (IdSeq <= 0)
            {
                return BadRequest("Invalid input data.");
            }

            decimal updatedTotal;
            bool success = _repository.DeleteInvoiceDetail(IdSeq, out updatedTotal);

            if (success)
            {
                return Ok(new { Message = "Invoice detail deleted successfully.", UpdatedTotal = updatedTotal });
            }
            else
            {
                return BadRequest("Failed to delete invoice detail.");
            }
        }

        [HttpPost]
        [Route("GetDetails/{ihSeq}")]
        public IHttpActionResult GetInvoiceDetailsByHeaderSeq(int ihSeq)
        {
            if (ihSeq <= 0)
            {
                return BadRequest("Invalid invoice header sequence.");
            }

            var invoiceDetails = _repository.GetInvoiceDetailsByHeaderSeq(ihSeq);
            if (invoiceDetails == null || !invoiceDetails.Any())
            {
                return NotFound();
            }

            return Ok(invoiceDetails);
        }

        [HttpPost]
        [Route("GetDetailsBySeq/{idSeq}")]
        public IHttpActionResult GetDetailsBySeq(int idSeq)
        {
            if (idSeq <= 0)
            {
                return BadRequest("Invalid invoice header sequence.");
            }

            var invoiceDetails = _repository.GetDetailsBySeq(idSeq);
            if (invoiceDetails == null)
            {
                return NotFound();
            }

            return Ok(invoiceDetails);
        }
    }
}
