const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();

// Create a county
async function createCounty(req, res) {
  try {
    const { name, region } = req.body;

    if (!name) {
      return res.status(400).json({ error: "County name is required" });
    }

    const county = await prisma.county.create({
      data: { name, region },
    });

    res.status(201).json(county);
  } catch (error) {
    console.error("Error creating county:", error);
    if (error.code === "P2002") {
      // Prisma unique constraint error
      return res.status(409).json({ error: "County name already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get all counties
async function getCounties(req, res) {
  try {
    const counties = await prisma.county.findMany({
      include: { articles: true }, // include articles if needed
    });
    res.json(counties);
  } catch (error) {
    console.error("Error fetching counties:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get single county by id
async function getCountyById(req, res) {
  try {
    const { id } = req.params;
    const county = await prisma.county.findUnique({
      where: { id: parseInt(id) },
      include: { articles: true },
    });

    if (!county) {
      return res.status(404).json({ error: "County not found" });
    }

    res.json(county);
  } catch (error) {
    console.error("Error fetching county:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Update county
async function updateCounty(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const county = await prisma.county.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.json(county);
  } catch (error) {
    console.error("Error updating county:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "County not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

// Delete county
async function deleteCounty(req, res) {
  try {
    const { id } = req.params;
    await prisma.county.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "County deleted successfully" });
  } catch (error) {
    console.error("Error deleting county:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "County not found" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

async function seedCounties(prisma) {
  const counties = [
    /* same JSON array */
  ];

  for (const county of counties) {
    await prisma.county.create({
      data: county,
    });
  }
}

module.exports = {
  createCounty,
  getCounties,
  getCountyById,
  updateCounty,
  deleteCounty,
  seedCounties,
};
