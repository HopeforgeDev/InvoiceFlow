using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace InventoryFinalProject.Models
{
    
    public class InvoiceHeader
    {
        [Key]
        public int IhSeq { get; set; }
        public int IhNumber { get; set; }
        public string IhClientName { get; set; }
        public decimal IhTotal { get; set; } 
        public DateTime IhAddDate { get; set; } = DateTime.Now;
    }
 
}