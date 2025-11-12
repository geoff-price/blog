#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Ski rental data for Telluride area
interface SkiRental {
  id: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  website?: string;
  description: string;
  services: string[];
  rentalTypes: string[];
  priceRange: string;
  hours?: string;
}

const skiRentals: SkiRental[] = [
  {
    id: "telluride-sports",
    name: "Telluride Sports",
    location: "Telluride",
    address: "150 W Colorado Ave, Telluride, CO 81435",
    phone: "(970) 728-4477",
    website: "https://www.tellurideports.com",
    description: "Full-service ski and snowboard shop in downtown Telluride offering premium rentals, demos, and expert fitting services.",
    services: ["Ski Rentals", "Snowboard Rentals", "Demo Equipment", "Tune-ups", "Repairs", "Boot Fitting"],
    rentalTypes: ["Adult Skis", "Junior Skis", "Performance Skis", "Snowboards", "Boots", "Poles", "Helmets"],
    priceRange: "$40-$80/day",
    hours: "8:00 AM - 6:00 PM daily"
  },
  {
    id: "bootdoctors",
    name: "Bootdoctors",
    location: "Mountain Village",
    address: "568 Mountain Village Blvd, Mountain Village, CO 81435",
    phone: "(970) 728-4882",
    website: "https://www.bootdoctors.com",
    description: "Renowned for custom boot fitting and high-performance ski rentals. Located at the base of the gondola in Mountain Village.",
    services: ["Premium Rentals", "Custom Boot Fitting", "Expert Advice", "Demo Skis", "Repairs"],
    rentalTypes: ["High-Performance Skis", "All-Mountain Skis", "Powder Skis", "Touring Equipment", "Custom Boots"],
    priceRange: "$50-$100/day",
    hours: "8:00 AM - 5:00 PM daily"
  },
  {
    id: "jagged-edge",
    name: "Jagged Edge Mountain Gear",
    location: "Telluride",
    address: "223 E Colorado Ave, Telluride, CO 81435",
    phone: "(970) 728-9264",
    website: "https://www.jaggededgemountaingear.com",
    description: "Local favorite offering quality ski rentals, backcountry gear, and personalized service in downtown Telluride.",
    services: ["Ski Rentals", "Backcountry Gear", "Avalanche Safety Equipment", "Repairs", "Expert Consultation"],
    rentalTypes: ["All-Mountain Skis", "Backcountry Skis", "Touring Gear", "Splitboards", "Safety Equipment"],
    priceRange: "$35-$75/day",
    hours: "8:00 AM - 6:00 PM daily"
  },
  {
    id: "paragon-ski-snowboard",
    name: "Paragon Ski & Snowboard",
    location: "Mountain Village",
    address: "Mountain Village Plaza, Mountain Village, CO 81435",
    phone: "(970) 369-0435",
    website: "https://www.paragontelluride.com",
    description: "Conveniently located in Mountain Village offering a wide selection of rental equipment for all skill levels.",
    services: ["Ski Rentals", "Snowboard Rentals", "Group Rentals", "Online Reservations", "Delivery Service"],
    rentalTypes: ["Beginner Packages", "Intermediate Skis", "Advanced Skis", "Snowboards", "Kids Equipment"],
    priceRange: "$35-$70/day",
    hours: "7:30 AM - 5:30 PM daily"
  },
  {
    id: "telluride-ski-rental-delivery",
    name: "Telluride Ski Rental Delivery",
    location: "Telluride (Delivery Service)",
    address: "Delivery to your location in Telluride area",
    phone: "(970) 708-8754",
    website: "https://www.tellurideskirentaldelivery.com",
    description: "Premium ski rental delivery service bringing equipment directly to your accommodation with professional fitting.",
    services: ["Delivery Service", "In-Room Fitting", "Premium Equipment", "Flexible Pickup", "24/7 Support"],
    rentalTypes: ["Premium Skis", "High-End Snowboards", "Kids Equipment", "Full Packages"],
    priceRange: "$45-$90/day + delivery fee",
    hours: "By appointment - 7 days a week"
  },
  {
    id: "mountain-sports-telluride",
    name: "Mountain Sports Telluride",
    location: "Telluride",
    address: "100 W San Juan Ave, Telluride, CO 81435",
    phone: "(970) 728-4239",
    description: "Long-established Telluride shop offering affordable ski rentals and expert local knowledge.",
    services: ["Ski Rentals", "Snowboard Rentals", "Repairs", "Waxing", "Tune-ups"],
    rentalTypes: ["Standard Skis", "Performance Skis", "Snowboards", "Kids Equipment", "Boots", "Helmets"],
    priceRange: "$30-$65/day",
    hours: "8:00 AM - 6:00 PM daily"
  }
];

// Create server instance
const server = new Server(
  {
    name: "telluride-ski-rental-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools: Tool[] = [
    {
      name: "list_ski_rentals",
      description: "Get a list of all ski rental places near Telluride, Colorado with their details",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "get_rental_details",
      description: "Get detailed information about a specific ski rental shop by ID",
      inputSchema: {
        type: "object",
        properties: {
          rental_id: {
            type: "string",
            description: "The ID of the ski rental shop",
          },
        },
        required: ["rental_id"],
      },
    },
    {
      name: "search_rentals",
      description: "Search for ski rental shops by location, service type, or rental type",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (location, service, or equipment type)",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "get_rental_recommendations",
      description: "Get ski rental recommendations based on needs (beginner, expert, backcountry, delivery, etc.)",
      inputSchema: {
        type: "object",
        properties: {
          need: {
            type: "string",
            description: "Type of need: 'beginner', 'expert', 'backcountry', 'delivery', 'budget', 'premium', 'family'",
          },
        },
        required: ["need"],
      },
    },
  ];

  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "list_ski_rentals") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(skiRentals, null, 2),
          },
        ],
      };
    }

    if (name === "get_rental_details") {
      const rentalId = args.rental_id as string;
      const rental = skiRentals.find((r) => r.id === rentalId);

      if (!rental) {
        return {
          content: [
            {
              type: "text",
              text: `Ski rental shop with ID "${rentalId}" not found.`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(rental, null, 2),
          },
        ],
      };
    }

    if (name === "search_rentals") {
      const query = (args.query as string).toLowerCase();
      const results = skiRentals.filter(
        (rental) =>
          rental.name.toLowerCase().includes(query) ||
          rental.location.toLowerCase().includes(query) ||
          rental.description.toLowerCase().includes(query) ||
          rental.services.some((s) => s.toLowerCase().includes(query)) ||
          rental.rentalTypes.some((t) => t.toLowerCase().includes(query))
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    }

    if (name === "get_rental_recommendations") {
      const need = (args.need as string).toLowerCase();
      let recommendations: SkiRental[] = [];
      let explanation = "";

      switch (need) {
        case "beginner":
          recommendations = skiRentals.filter(
            (r) =>
              r.rentalTypes.some((t) => t.toLowerCase().includes("beginner")) ||
              r.id === "paragon-ski-snowboard" ||
              r.id === "mountain-sports-telluride"
          );
          explanation = "These shops offer beginner-friendly equipment and packages with great service for first-timers.";
          break;

        case "expert":
        case "advanced":
          recommendations = skiRentals.filter(
            (r) =>
              r.rentalTypes.some((t) => t.toLowerCase().includes("performance") || t.toLowerCase().includes("premium")) ||
              r.id === "bootdoctors" ||
              r.id === "telluride-sports"
          );
          explanation = "These shops specialize in high-performance equipment and expert boot fitting for advanced skiers.";
          break;

        case "backcountry":
        case "touring":
          recommendations = skiRentals.filter(
            (r) =>
              r.services.some((s) => s.toLowerCase().includes("backcountry")) ||
              r.rentalTypes.some((t) => t.toLowerCase().includes("backcountry") || t.toLowerCase().includes("touring"))
          );
          explanation = "These shops offer backcountry and touring equipment with avalanche safety gear.";
          break;

        case "delivery":
          recommendations = skiRentals.filter(
            (r) => r.services.some((s) => s.toLowerCase().includes("delivery")) || r.id === "telluride-ski-rental-delivery"
          );
          explanation = "These shops offer delivery service to your accommodation.";
          break;

        case "budget":
        case "affordable":
          recommendations = skiRentals.filter(
            (r) => r.priceRange.includes("$30") || r.priceRange.includes("$35") || r.id === "mountain-sports-telluride"
          );
          explanation = "These shops offer the most affordable rental options in the Telluride area.";
          break;

        case "premium":
        case "luxury":
          recommendations = skiRentals.filter(
            (r) => r.id === "bootdoctors" || r.id === "telluride-ski-rental-delivery" || r.id === "telluride-sports"
          );
          explanation = "These shops offer premium equipment and high-end services for the best skiing experience.";
          break;

        case "family":
        case "kids":
          recommendations = skiRentals.filter((r) => r.rentalTypes.some((t) => t.toLowerCase().includes("kids") || t.toLowerCase().includes("junior")));
          explanation = "These shops have great options for families and children's equipment.";
          break;

        default:
          recommendations = skiRentals;
          explanation = "Here are all available ski rental options in the Telluride area.";
      }

      const response = {
        explanation,
        recommendations,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response, null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Unknown tool: ${name}`,
        },
      ],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Telluride Ski Rental MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
