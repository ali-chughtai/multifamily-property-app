import { AppDataSource } from "../data-source";
import { Property } from "../entities/Property";
import { TenantProfile } from "../entities/TenantProfile";
import { Amenity } from "../entities/Amenity";
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { DatabaseError, AppError } from './errors';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text: string, params?: any[]) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    throw new DatabaseError(`Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    throw new DatabaseError('Failed to obtain database client connection');
  }
};

export const initializeDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      await seedAmenities();
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new DatabaseError(`Database initialization failed: ${errorMessage}`);
  }
};

const seedAmenities = async () => {
  try {
    const amenityRepository = AppDataSource.getRepository(Amenity);
    const count = await amenityRepository.count();
    
    if (count === 0) {
      const amenities = [
        {
          name: 'State-of-the-Art Gym',
          estimatedCost: 25000,
          description: 'Modern fitness facility with cardio, strength training, and free weights',
          category: 'fitness',
          targetDemographics: ['young-professionals', 'health-conscious', 'fitness-enthusiasts']
        },
        {
          name: 'Swimming Pool & Spa',
          estimatedCost: 75000,
          description: 'Resort-style pool with hot tub and poolside cabanas',
          category: 'fitness',
          targetDemographics: ['families', 'luxury-seekers', 'health-conscious']
        },
        {
          name: 'Yoga & Meditation Studio',
          estimatedCost: 12000,
          description: 'Serene space for yoga classes, meditation, and wellness activities',
          category: 'fitness',
          targetDemographics: ['health-conscious', 'wellness-focused', 'stress-relief']
        },
        {
          name: 'Tennis Court',
          estimatedCost: 45000,
          description: 'Professional tennis court with lighting for evening play',
          category: 'fitness',
          targetDemographics: ['sports-enthusiasts', 'affluent-residents', 'active-lifestyle']
        },
        {
          name: 'Basketball Court',
          estimatedCost: 30000,
          description: 'Full-size basketball court with professional flooring',
          category: 'fitness',
          targetDemographics: ['young-adults', 'sports-enthusiasts', 'families']
        },

        {
          name: 'Co-working Space',
          estimatedCost: 15000,
          description: 'Modern shared workspace with high-speed internet and printing facilities',
          category: 'work',
          targetDemographics: ['remote-workers', 'entrepreneurs', 'freelancers', 'young-professionals']
        },
        {
          name: 'Business Center',
          estimatedCost: 20000,
          description: 'Professional business center with conference rooms and office equipment',
          category: 'work',
          targetDemographics: ['business-professionals', 'entrepreneurs', 'corporate-executives']
        },
        {
          name: 'Conference Room',
          estimatedCost: 8000,
          description: 'Professional meeting space with AV equipment and video conferencing',
          category: 'work',
          targetDemographics: ['business-professionals', 'remote-workers', 'entrepreneurs']
        },
        {
          name: 'Study Rooms',
          estimatedCost: 10000,
          description: 'Quiet study spaces with desks, Wi-Fi, and charging stations',
          category: 'work',
          targetDemographics: ['students', 'remote-workers', 'academics']
        },

        {
          name: 'Rooftop Lounge',
          estimatedCost: 40000,
          description: 'Stunning rooftop entertainment space with city views and outdoor seating',
          category: 'social',
          targetDemographics: ['young-professionals', 'entertainers', 'luxury-seekers', 'socializers']
        },
        {
          name: 'Community Room',
          estimatedCost: 18000,
          description: 'Multipurpose space for events, parties, and community gatherings',
          category: 'social',
          targetDemographics: ['families', 'community-oriented', 'entertainers']
        },
        {
          name: 'Theater Room',
          estimatedCost: 35000,
          description: 'Private movie theater with surround sound and premium seating',
          category: 'social',
          targetDemographics: ['entertainment-lovers', 'families', 'luxury-seekers']
        },
        {
          name: 'Game Room',
          estimatedCost: 15000,
          description: 'Recreation room with pool table, arcade games, and entertainment systems',
          category: 'social',
          targetDemographics: ['young-adults', 'families', 'entertainment-lovers']
        },
        {
          name: 'BBQ & Grilling Area',
          estimatedCost: 12000,
          description: 'Outdoor grilling stations with picnic tables and seating areas',
          category: 'social',
          targetDemographics: ['families', 'entertainers', 'outdoor-enthusiasts']
        },
        {
          name: 'Wine Cellar & Tasting Room',
          estimatedCost: 25000,
          description: 'Climate-controlled wine storage with private tasting area',
          category: 'social',
          targetDemographics: ['wine-enthusiasts', 'luxury-seekers', 'entertainers']
        },

        {
          name: 'Playground',
          estimatedCost: 20000,
          description: 'Safe, modern playground equipment for children of all ages',
          category: 'family',
          targetDemographics: ['families', 'parents', 'child-friendly']
        },
        {
          name: 'Kids Club Room',
          estimatedCost: 12000,
          description: 'Supervised children\'s activity room with toys and educational materials',
          category: 'family',
          targetDemographics: ['families', 'parents', 'childcare-needs']
        },
        {
          name: 'Family Pool',
          estimatedCost: 50000,
          description: 'Shallow family-friendly pool with safety features',
          category: 'family',
          targetDemographics: ['families', 'parents', 'child-friendly']
        },

        {
          name: 'Dog Park',
          estimatedCost: 18000,
          description: 'Fenced off-leash area with agility equipment and waste stations',
          category: 'pets',
          targetDemographics: ['pet-owners', 'dog-lovers']
        },
        {
          name: 'Pet Wash Station',
          estimatedCost: 8000,
          description: 'Professional pet grooming station with tubs and supplies',
          category: 'pets',
          targetDemographics: ['pet-owners', 'dog-lovers']
        },
        {
          name: 'Pet Daycare',
          estimatedCost: 22000,
          description: 'On-site pet care facility with trained staff',
          category: 'pets',
          targetDemographics: ['pet-owners', 'working-professionals']
        },

        {
          name: 'Concierge Service',
          estimatedCost: 60000,
          description: '24/7 concierge service for packages, reservations, and assistance',
          category: 'luxury',
          targetDemographics: ['luxury-seekers', 'busy-professionals', 'convenience-focused']
        },
        {
          name: 'Valet Parking',
          estimatedCost: 50000,
          description: 'Professional valet parking service for residents and guests',
          category: 'luxury',
          targetDemographics: ['luxury-seekers', 'busy-professionals', 'convenience-focused']
        },
        {
          name: 'Private Dining Room',
          estimatedCost: 30000,
          description: 'Elegant private dining space for special occasions',
          category: 'luxury',
          targetDemographics: ['luxury-seekers', 'entertainers', 'special-occasions']
        },

        {
          name: 'Package Concierge',
          estimatedCost: 15000,
          description: 'Secure package receiving and storage system',
          category: 'convenience',
          targetDemographics: ['online-shoppers', 'busy-professionals', 'convenience-focused']
        },
        {
          name: 'Laundry Facility',
          estimatedCost: 25000,
          description: 'High-efficiency washers and dryers with card/app payment',
          category: 'convenience',
          targetDemographics: ['students', 'young-professionals', 'convenience-focused']
        },
        {
          name: 'Electric Car Charging',
          estimatedCost: 35000,
          description: 'Electric vehicle charging stations in parking areas',
          category: 'convenience',
          targetDemographics: ['eco-conscious', 'tech-savvy', 'electric-vehicle-owners']
        },
        {
          name: 'Bike Storage & Repair',
          estimatedCost: 10000,
          description: 'Secure bike storage with basic repair tools and air pump',
          category: 'convenience',
          targetDemographics: ['cyclists', 'eco-conscious', 'urban-commuters']
        },
        {
          name: 'Storage Units',
          estimatedCost: 20000,
          description: 'Individual storage units for resident belongings',
          category: 'convenience',
          targetDemographics: ['storage-needs', 'downsizers', 'urban-dwellers']
        },

        {
          name: '24/7 Security',
          estimatedCost: 80000,
          description: 'Round-the-clock security personnel and monitoring',
          category: 'security',
          targetDemographics: ['safety-conscious', 'luxury-seekers', 'families']
        },
        {
          name: 'Smart Access Control',
          estimatedCost: 25000,
          description: 'Keyless entry system with smartphone integration',
          category: 'security',
          targetDemographics: ['tech-savvy', 'convenience-focused', 'security-conscious']
        },
        {
          name: 'CCTV Surveillance',
          estimatedCost: 15000,
          description: 'Comprehensive camera system for common areas',
          category: 'security',
          targetDemographics: ['safety-conscious', 'security-focused']
        }
      ];
      
      const savedAmenities = await amenityRepository.save(amenities);
      return savedAmenities;
    }
  } catch (error) {
    throw new DatabaseError(`Failed to seed amenities: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getPropertyRepository = () => {
  try {
    return AppDataSource.getRepository(Property);
  } catch (error) {
    throw new DatabaseError('Failed to get Property repository');
  }
};

export const getTenantProfileRepository = () => {
  try {
    return AppDataSource.getRepository(TenantProfile);
  } catch (error) {
    throw new DatabaseError('Failed to get TenantProfile repository');
  }
};

export const getAmenityRepository = () => {
  try {
    return AppDataSource.getRepository(Amenity);
  } catch (error) {
    throw new DatabaseError('Failed to get Amenity repository');
  }
};