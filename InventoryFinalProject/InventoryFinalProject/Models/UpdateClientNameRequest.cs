using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace InventoryFinalProject.Models
{
    public class UpdateClientNameRequest
    {
        public int IhSeq { get; set; }
        public string NewClientName { get; set; }
    }

}