using InventoryFinalProject.Models;
using InventoryFinalProject.Repository;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.SqlTypes;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;
using System.Web.Http.Results;

namespace InventoryFinalProject.Controllers
{
    [RoutePrefix("api/invoices")]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class InvoiceHeaderController:ApiController
    {
        private readonly InvoiceHeaderRepository _repository;

        public InvoiceHeaderController()
        {
            _repository = new InvoiceHeaderRepository();
        }


        [HttpPost]
        [Route("AddInvoiceHeader")]
        public IHttpActionResult AddInvoiceHeader([FromBody] InvoiceHeaderRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.ClientName))
            {
                return BadRequest("Invalid invoice data.");
            }

            try
            {
                int newInvoiceSeq = _repository.InsertInvoiceHeader(request.ClientName, request.Total);
                return Ok(new { InvoiceSeq = newInvoiceSeq });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception("Failed to insert invoice header.", ex));
            }
        }

        [HttpPost]
        [Route("UpdateClientName")]
        public IHttpActionResult UpdateClientName([FromBody] UpdateClientNameRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.NewClientName))
            {
                return BadRequest("Invalid client data.");
            }

            try
            {
                int updatedId = _repository.UpdateClientName(request.IhSeq, request.NewClientName);
                return Ok(new { UpdatedId = updatedId });
            }
            catch (Exception ex)
            {
                return InternalServerError(new Exception("Failed to update client name.", ex));
            }
        }

        [HttpPost]
        [Route("Delete/{ihSeq}")]
        public IHttpActionResult DeleteInvoice(int ihSeq)
        {
            if (ihSeq <= 0)
            {
                return BadRequest("Invalid parameters.");
            }

            bool success = _repository.DeleteInvoice(ihSeq);
            if (success)
            {
                return Ok("Invoice deleted successfully.");
            }
            else
            {
                return BadRequest("Failed to delete invoice.");
            }
        }

        [HttpPost]
        [Route("GetAll")]
        public IHttpActionResult GetAllInvoiceHeaders()
        {
            IEnumerable<InvoiceHeader> invoiceHeaders = _repository.GetAllInvoiceHeaders();
            return Ok(invoiceHeaders);
        }
    }

}