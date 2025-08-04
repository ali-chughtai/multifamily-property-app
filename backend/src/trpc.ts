import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { getPropertyRepository, getTenantProfileRepository, getAmenityRepository } from './utils/db';
import { handleTRPCError, NotFoundError, ValidationError, DatabaseError } from './utils/errors';

const t = initTRPC.create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        statusCode: error.cause instanceof Error && 'statusCode' in error.cause 
          ? (error.cause as any).statusCode 
          : 500,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const propertyRouter = router({
  create: publicProcedure
    .input(z.object({
      location: z.string().min(1, 'Location is required').max(500, 'Location too long'),
      units: z.number().int().min(1, 'Units must be at least 1').max(10000, 'Units cannot exceed 10,000'),
      preferences: z.string().max(1000, 'Preferences too long').optional(),
      latitude: z.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude').optional(),
      longitude: z.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude').optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        if ((input.latitude && !input.longitude) || (!input.latitude && input.longitude)) {
          throw new ValidationError('Both latitude and longitude must be provided together');
        }

        const propertyRepo = getPropertyRepository();
        
        if (input.latitude && input.longitude) {
          const existingProperty = await propertyRepo.findOne({
            where: {
              latitude: input.latitude,
              longitude: input.longitude,
            },
          });
          
          if (existingProperty) {
            throw new ValidationError('A property already exists at this exact location');
          }
        }

        const property = propertyRepo.create({
          location: input.location.trim(),
          units: input.units,
          preferences: input.preferences?.trim(),
          latitude: input.latitude,
          longitude: input.longitude,
        });
        
        const savedProperty = await propertyRepo.save(property);
        
        if (!savedProperty.id) {
          throw new DatabaseError('Property was not saved properly');
        }
        
        return {
          id: savedProperty.id,
          location: savedProperty.location,
          units: savedProperty.units,
          preferences: savedProperty.preferences,
          latitude: savedProperty.latitude,
          longitude: savedProperty.longitude,
          createdAt: savedProperty.createdAt,
        };
      } catch (error) {
        handleTRPCError(error);
      }
    }),
  
  getById: publicProcedure
    .input(z.string().uuid('Invalid property ID format'))
    .query(async ({ input }) => {
      try {
        const propertyRepo = getPropertyRepository();
        const property = await propertyRepo.findOne({ 
          where: { id: input },
          relations: ['tenantProfiles'] 
        });
        
        if (!property) {
          throw new NotFoundError('Property');
        }
        
        return property;
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  getAll: publicProcedure
    .query(async () => {
      try {
        const propertyRepo = getPropertyRepository();
        const properties = await propertyRepo.find({
          order: { createdAt: 'DESC' },
          take: 100, 
        });
        
        return properties;
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  delete: publicProcedure
    .input(z.string().uuid('Invalid property ID format'))
    .mutation(async ({ input }) => {
      try {
        const propertyRepo = getPropertyRepository();
        const property = await propertyRepo.findOne({ where: { id: input } });
        
        if (!property) {
          throw new NotFoundError('Property');
        }
        
        await propertyRepo.remove(property);
        
        return { message: 'Property deleted successfully', id: input };
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});

const tenantRouter = router({
  generateProfile: publicProcedure
    .input(z.object({
      propertyId: z.string().uuid('Invalid property ID format'),
      ageRange: z.string().min(1, 'Age range is required'),
      incomeRange: z.string().min(1, 'Income range is required'),
      lifestyle: z.string().optional(),
      preferences: z.array(z.string()).max(20, 'Too many preferences').optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const tenantRepo = getTenantProfileRepository();
        const propertyRepo = getPropertyRepository();
        
        const property = await propertyRepo.findOne({ where: { id: input.propertyId } });
        if (!property) {
          throw new NotFoundError('Property');
        }

        const existingProfile = await tenantRepo.findOne({
          where: { property: { id: input.propertyId } }
        });
        
        if (existingProfile) {
          throw new ValidationError('A tenant profile already exists for this property');
        }

        const generateIdealTenantDescription = (ageRange: string, incomeRange: string, lifestyle?: string, location?: string) => {
          const lifestyleText = lifestyle ? `${lifestyle} ` : '';
          const locationContext = location ? ` in ${location.split(',')[0]}` : '';
          
          return `Ideal tenant profile: ${lifestyleText}individuals aged ${ageRange} with ${incomeRange} annual income${locationContext}. ` +
                 `Perfect for those seeking modern amenities and convenient location access.`;
        };
        
        const tenantProfile = tenantRepo.create({
          ageRange: input.ageRange,
          incomeRange: input.incomeRange,
          lifestyle: input.lifestyle,
          preferences: input.preferences || [],
          property: property,
          idealTenant: generateIdealTenantDescription(
            input.ageRange, 
            input.incomeRange, 
            input.lifestyle, 
            property.location
          ),
        });
        
        const savedProfile = await tenantRepo.save(tenantProfile);
        
        return {
          id: savedProfile.id,
          ageRange: savedProfile.ageRange,
          incomeRange: savedProfile.incomeRange,
          lifestyle: savedProfile.lifestyle,
          preferences: savedProfile.preferences,
          idealTenant: savedProfile.idealTenant,
          createdAt: savedProfile.createdAt,
        };
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  getByPropertyId: publicProcedure
    .input(z.string().uuid('Invalid property ID format'))
    .query(async ({ input }) => {
      try {
        const tenantRepo = getTenantProfileRepository();
        const profiles = await tenantRepo.find({
          where: { property: { id: input } },
          relations: ['suggestedAmenities', 'property'],
          order: { createdAt: 'DESC' },
        });
        
        return profiles;
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string().uuid('Invalid tenant profile ID format'),
      ageRange: z.string().optional(),
      incomeRange: z.string().optional(),
      lifestyle: z.string().optional(),
      preferences: z.array(z.string()).max(20, 'Too many preferences').optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const tenantRepo = getTenantProfileRepository();
        const profile = await tenantRepo.findOne({ where: { id: input.id } });
        
        if (!profile) {
          throw new NotFoundError('Tenant Profile');
        }
        
        Object.assign(profile, input);
        const updatedProfile = await tenantRepo.save(profile);
        
        return updatedProfile;
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});

const amenityRouter = router({
  getSuggestions: publicProcedure
    .input(z.object({
      tenantProfileId: z.string().uuid().optional(),
      ageRange: z.string().optional(),
      lifestyle: z.string().optional(),
      incomeRange: z.string().optional(),
      category: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const amenityRepo = getAmenityRepository();
        
        let amenities = await amenityRepo.find({
          order: { category: 'ASC', estimatedCost: 'ASC' }
        });
        
        if (!input) {
          return amenities;
        }

        let filteredAmenities = amenities;

        if (input.category) {
          filteredAmenities = filteredAmenities.filter(amenity => 
            amenity.category.toLowerCase() === input.category!.toLowerCase()
          );
        }

        if (input.lifestyle) {
          const lifestyleKey = input.lifestyle.toLowerCase().replace(/\s+/g, '-');
          filteredAmenities = filteredAmenities.filter(amenity => 
            amenity.targetDemographics.some(demo => 
              demo.toLowerCase().includes(lifestyleKey) ||
              demo.toLowerCase().includes(input.lifestyle!.toLowerCase())
            )
          );
        }
        
        if (input.ageRange) {
          const ageNum = parseInt(input.ageRange.split('-')[0]);
          
          if (ageNum <= 25) {
            filteredAmenities = filteredAmenities.filter(amenity => 
              amenity.targetDemographics.some(demo => 
                demo.includes('young') || demo.includes('student') || demo.includes('entertainment')
              )
            );
          } else if (ageNum <= 35) {
            filteredAmenities = filteredAmenities.filter(amenity => 
              amenity.targetDemographics.some(demo => 
                demo.includes('professional') || demo.includes('fitness') || demo.includes('work')
              )
            );
          } else if (ageNum <= 55) {
            filteredAmenities = filteredAmenities.filter(amenity => 
              amenity.targetDemographics.some(demo => 
                demo.includes('family') || demo.includes('luxury') || demo.includes('convenience')
              )
            );
          }
        }

        if (input.incomeRange) {
          const incomeNum = parseInt(input.incomeRange.replace(/[^0-9]/g, ''));
          
          if (incomeNum >= 100000) {
            filteredAmenities = filteredAmenities.filter(amenity => 
              amenity.targetDemographics.includes('luxury-seekers') ||
              amenity.category === 'luxury' ||
              amenity.estimatedCost > 30000
            );
          }
        }

        if (filteredAmenities.length === 0) {
          filteredAmenities = amenities.filter(amenity => 
            ['gym', 'pool', 'parking', 'security'].some(popular => 
              amenity.name.toLowerCase().includes(popular)
            )
          );
        }

        return filteredAmenities.slice(0, 10); 
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  getAll: publicProcedure
    .query(async () => {
      try {
        const amenityRepo = getAmenityRepository();
        const amenities = await amenityRepo.find({
          order: { category: 'ASC', name: 'ASC' }
        });
        
        return amenities;
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  getByCategory: publicProcedure
    .input(z.string().min(1, 'Category is required'))
    .query(async ({ input }) => {
      try {
        const amenityRepo = getAmenityRepository();
        const amenities = await amenityRepo.find({
          where: { category: input },
          order: { estimatedCost: 'ASC' }
        });
        
        return amenities;
      } catch (error) {
        handleTRPCError(error);
      }
    }),

  getCategories: publicProcedure
    .query(async () => {
      try {
        const amenityRepo = getAmenityRepository();
        const categories = await amenityRepo
          .createQueryBuilder('amenity')
          .select('DISTINCT amenity.category', 'category')
          .getRawMany();
        
        return categories.map(c => c.category).sort();
      } catch (error) {
        handleTRPCError(error);
      }
    }),
});

export const appRouter = router({
  property: propertyRouter,
  tenant: tenantRouter,
  amenity: amenityRouter,
});

export type AppRouter = typeof appRouter;
